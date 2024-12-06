import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { pullCommits } from "@/lib/github";
import { checkCredits, indexGithubRepo } from "@/lib/github-loader";
import { TRPCError } from "@trpc/server";
import { clerkClient } from '@clerk/clerk-sdk-node';

export const projectRouter = createTRPCRouter({
    createProject: protectedProcedure.input(
        z.object({
            name: z.string(),
            githubUrl: z.string(),
            githubToken: z.string().optional()
        })
    ).mutation(async ({ ctx, input }) => {
        const userCredits = await ctx.db.user.findUnique({
            where: {
                id: ctx.user.userId!
            },
            select: {
                credits: true
            }
        })
        if (!userCredits) {
            throw new Error("Not Found")
        }
        const currentCredits = userCredits.credits || 0
        const filecount = await checkCredits(input.githubUrl, input.githubToken)

        if (currentCredits < filecount) {
            throw new Error("Insufficient Credits")
        }

        const project = await ctx.db.project.create({
            data: {
                githubUrl: input.githubUrl,
                name: input.name,
                UserToProject: {
                    create: {
                        userId: ctx.user.userId!
                    }
                }
            }
        })
        await indexGithubRepo(project.id, input.githubUrl, input.githubToken)
        await pullCommits(project.id)
        await ctx.db.user.update({
            where: {
                id: ctx.user.userId!
            },
            data: {
                credits: {
                    decrement: filecount
                }
            }
        })
        return project
    }),
    getProjects: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.project.findMany({
            where: {
                UserToProject: {
                    some: {
                        userId: ctx.user.userId!
                    }
                },
                deletedAt: null
            }
        })
    }),
    getCommits: protectedProcedure.input(z.object({
        projectId: z.string()
    })).query(async ({ ctx, input }) => {
        pullCommits(input.projectId).then().catch(console.error)
        return await ctx.db.commit.findMany({
            where: {
                projectId: input.projectId
            }
        })
    }),
    saveAnswer: protectedProcedure.input(z.object({
        projectId: z.string(),
        question: z.string(),
        answer: z.string(),
        filesReferences: z.any()
    })).mutation(async ({ ctx, input }) => {
        return await ctx.db.question.create({
            data: {
                answer: input.answer,
                filesReferences: input.filesReferences,
                projectId: input.projectId,
                question: input.question,
                userId: ctx.user.userId!
            }
        })
    }),
    getQuestions: protectedProcedure.input(z.object({
        projectId: z.string(),
    })).query(async ({ ctx, input }) => {
        return await ctx.db.question.findMany({
            where: {
                projectId: input.projectId
            },
            include: {
                user: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
    }),
    archiveProject: protectedProcedure.input(z.object({
        projectId: z.string(),
    })).mutation(async ({ ctx, input }) => {
        return await ctx.db.project.update({
            where: {
                id: input.projectId
            },
            data: {
                deletedAt: new Date()
            }
        })
    }),
    deleteQuestion: protectedProcedure
        .input(
            z.object({
                questionId: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const question = await ctx.db.question.delete({
                where: {
                    id: input.questionId,
                },
            });
            return question;
        }),

    unarchiveProject: protectedProcedure.input(z.object({
        projectId: z.string(),
    })).mutation(async ({ ctx, input }) => {
        // Assuming you unarchive the project by setting deletedAt to null
        return await ctx.db.project.update({
            where: {
                id: input.projectId,
            },
            data: {
                deletedAt: null, // Unarchive by setting deletedAt to null
            },
        });
    }),


    // Query to fetch archived projects
    getArchivedProjects: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.project.findMany({
            where: {
                deletedAt: {
                    not: null, // Fetch projects where deletedAt is not null
                },
            },
        });
    }),

    getTeamMembers: protectedProcedure.input(z.object({
        projectId: z.string(),
    })).query(async ({ ctx, input }) => {
        return await ctx.db.userToProject.findMany({
            where: {
                projectId: input.projectId
            },
            include: {
                user: true
            },
        })
    }),

    getMyCredits: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.user.findUnique({
            where: {
                id: ctx.user.userId!
            },
            select: {
                credits: true
            }
        })
    }),

    checkCredits: protectedProcedure
        .input(
            z.object({
                githubUrl: z.string(),
                githubToken: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const filecount = await checkCredits(input.githubUrl, input.githubToken);
            const userCredits = await ctx.db.user.findUnique({
                where: {
                    id: ctx.user.userId!
                },
                select: {
                    credits: true
                }
            })
            return { filecount, userCredits: userCredits?.credits || 0 }
        })

})