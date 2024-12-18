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
        // Step 1: Check the user's credits
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

        // Step 2: Create the project
        const project = await ctx.db.project.create({
            data: {
                githubUrl: input.githubUrl,
                name: input.name,
                UserToProject: {
                    create: {
                        userId: ctx.user.userId!, // The first user
                        isAdmin: true // Mark this user as admin
                    }
                }
            }
        })

        // Step 3: Perform additional operations like indexing and pulling commits
        await indexGithubRepo(project.id, input.githubUrl, input.githubToken)
        await pullCommits(project.id)

        // Step 4: Deduct the credits from the user's account
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

        // Step 5: Return the created project
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

    deleteProject: protectedProcedure.input(
        z.object({
            projectId: z.string(),
        })
    ).mutation(async ({ ctx, input }) => {
        const { projectId } = input;

        // Ensure that the user owns this project
        const project = await ctx.db.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "You are not authorized to delete this project.",
            });
        }

        try {
            await ctx.db.$transaction(async (trx) => {
                // Delete commits related to the project
                await trx.commit.deleteMany({
                    where: {
                        projectId: input.projectId,
                    },
                });


                await trx.note.deleteMany({
                    where: {
                        projectId: input.projectId,
                    }
                });

                await trx.question.deleteMany({
                    where: {
                        projectId: input.projectId
                    }
                })

                // Delete sourcecodeembeddings related to the project
                await trx.sourceCodeEmbedding.deleteMany({
                    where: {
                        projectId: input.projectId,
                    },
                });

                // Delete the association in UserToProject
                await trx.userToProject.deleteMany({
                    where: {
                        projectId: input.projectId,
                    },
                });

                // Finally, delete the project itself
                await trx.project.delete({
                    where: { id: input.projectId },
                });
            });

            return { success: true };
        } catch (error) {
            console.error("Transaction failed: ", error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to delete project and related data.",
            });
        }
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
        }),

    getNotes: protectedProcedure.input(
        z.object({
            projectId: z.string(),
        })
    ).query(async ({ ctx, input }) => {
        return await ctx.db.note.findMany({
            where: {
                projectId: input.projectId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }),

    // Add a new note
    addNote: protectedProcedure.input(
        z.object({
            projectId: z.string(),
            content: z.string().min(1, 'Note content cannot be empty.'),
        })
    ).mutation(async ({ ctx, input }) => {
        return await ctx.db.note.create({
            data: {
                projectId: input.projectId,
                content: input.content,
                userId: ctx.user.userId!,
            },
        });
    }),

    // Edit an existing note
    updateNote: protectedProcedure.input(
        z.object({
            noteId: z.string(),
            content: z.string().min(1, 'Note content cannot be empty.'),
        })
    ).mutation(async ({ ctx, input }) => {
        const note = await ctx.db.note.findUnique({
            where: { id: input.noteId },
        });

        if (!note || note.userId !== ctx.user.userId!) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not authorized to edit this note.' });
        }

        return await ctx.db.note.update({
            where: { id: input.noteId },
            data: { content: input.content },
        });
    }),

    // Delete a note
    deleteNote: protectedProcedure.input(
        z.object({
            noteId: z.string(),
        })
    ).mutation(async ({ ctx, input }) => {
        const note = await ctx.db.note.findUnique({
            where: { id: input.noteId },
        });

        if (!note || note.userId !== ctx.user.userId!) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not authorized to delete this note.' });
        }

        return await ctx.db.note.delete({
            where: { id: input.noteId },
        });
    }),
    uploadMeeting: protectedProcedure.input(z.object({
        projectId: z.string(),
        meetingUrl: z.string(),
        name: z.string()
    })).mutation(async ({ ctx, input }) => {
        const meeting = await ctx.db.meeting.create({
            data: {
                meetingurl: input.meetingUrl,
                projectId: input.projectId,
                name: input.name,
                status: "PROCESSING"
            }
        })
        return meeting
    }),
    getMeetings: protectedProcedure.input(
        z.object({
            projectId: z.string(),
        })
    ).query(async ({ ctx, input }) => {
        return await ctx.db.meeting.findMany({
            where: {
                projectId: input.projectId,
            },
            include: {
                issues: true
            }
        });
    }),
    deleteMeeting: protectedProcedure.input(
        z.object({
            meetingId: z.string(),
        })
    ).mutation(async ({ ctx, input }) => {
        return await ctx.db.meeting.delete({
            where: { id: input.meetingId },
        });
    }),
    getMeetingById: protectedProcedure.input(
        z.object({
            meetingId: z.string(),
        })
    ).query(async ({ ctx, input }) => {
        return await ctx.db.meeting.findUnique({
            where: {
                id: input.meetingId,
            },
            include: {
                issues: true
            }
        });
    }),
    getTransactions: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.transaction.findMany({
            where: {
                userId: ctx.user.userId!,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }),
    addBug: protectedProcedure.input(
        z.object({
            projectId: z.string(),
            title: z.string().min(1, 'Bug title cannot be empty.'),
            description: z.string().min(1, 'Bug description cannot be empty.'),
        })
    ).mutation(async ({ ctx, input }) => {
        return await ctx.db.bug.create({
            data: {
                projectId: input.projectId,
                title: input.title,
                description: input.description,
                userId: ctx.user.userId!,
            },
        });
    }),

    // Edit an existing bug
    updateBug: protectedProcedure.input(
        z.object({
            bugId: z.string(),
            title: z.string().min(1, 'Bug title cannot be empty.'),
            description: z.string().min(1, 'Bug description cannot be empty.'),
            status: z.enum(['PENDING', 'FIXED']),
        })
    ).mutation(async ({ ctx, input }) => {
        const bug = await ctx.db.bug.findUnique({
            where: { id: input.bugId },
        });

        if (!bug || bug.userId !== ctx.user.userId!) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not authorized to edit this bug.' });
        }

        return await ctx.db.bug.update({
            where: { id: input.bugId },
            data: {
                title: input.title,
                description: input.description,
                status: input.status,
            },
        });
    }),

    // Delete a bug
    deleteBug: protectedProcedure.input(
        z.object({
            bugId: z.string(),
        })
    ).mutation(async ({ ctx, input }) => {
        const bug = await ctx.db.bug.findUnique({
            where: { id: input.bugId },
        });

        if (!bug || bug.userId !== ctx.user.userId!) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not authorized to delete this bug.' });
        }

        return await ctx.db.bug.delete({
            where: { id: input.bugId },
        });
    }),
    getAllBugs: protectedProcedure
        .input(
            z.object({
                projectId: z.string(), // Ensure the projectId is provided for filtering
            })
        )
        .query(async ({ ctx, input }) => {
            return await ctx.db.bug.findMany({
                where: {
                    projectId: input.projectId,
                },
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            emailAddress: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        }),

    saveAnalysis: protectedProcedure.input(z.object({
        projectId: z.string(),
        answer: z.string(),
    })).mutation(async ({ ctx, input }) => {
        return await ctx.db.analyze.create({
            data: {
                answer: input.answer,
                projectId: input.projectId,
                userId: ctx.user.userId!
            }
        })
    }),
    getAnalysis: protectedProcedure.input(z.object({
        projectId: z.string(),
    })).query(async ({ ctx, input }) => {
        return await ctx.db.analyze.findMany({
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


})