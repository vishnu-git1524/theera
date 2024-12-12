'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/trpc/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import useRefetch from '../../../hooks/use-refetch'
import { redirect, useRouter } from 'next/navigation'
import { Info } from 'lucide-react'

type FormInput = {
    repoUrl: string
    projectName: string
    githubToken?: string
}

const CreatePage = () => {
    const { register, handleSubmit, reset } = useForm<FormInput>()
    const createProject = api.project.createProject.useMutation()
    const checkCredits = api.project.checkCredits.useMutation()
    const refetch = useRefetch()
    const router = useRouter(); // Use Next.js router for navigation

    async function onSubmit(data: FormInput) {
        if (!!checkCredits.data) {
            toast.promise(
                createProject
                    .mutateAsync({
                        githubUrl: data.repoUrl,
                        name: data.projectName,
                        githubToken: data.githubToken,
                    })
                    .then(() => {
                        refetch(); // Trigger refetch after successful creation
                        reset(); // Reset the form
                        router.push('/dashboard'); // Navigate to dashboard
                    }),
                {
                    loading: 'Creating project...',
                    success: 'Project created successfully!',
                    error: (err) => {
                        if (err instanceof Error) {
                            return err.message; // Use backend-provided error message
                        }
                        return 'Failed to create project. Please try again.';
                    },
                }
            );
        } else {
            try {
                await checkCredits.mutateAsync({
                    githubToken: data.githubToken,
                    githubUrl: data.repoUrl,
                });
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : 'Failed to check credits. Please try again.'
                );
            }
        }
    }

    const hasEnoughCredits = checkCredits?.data?.userCredits ? checkCredits.data.filecount <= checkCredits.data.userCredits : true
    return (
        <div className='flex items-center gap-12 h-full justify-center'>
            <img src='/undraw_github.svg' className='h-56 w-auto' />
            <div>
                <div>
                    <h1 className='font-semibold text-2xl'>
                        Link your Github Repository
                    </h1>
                    <p className='text-sm text-muted-foreground'>
                        Enter the URL of your repository to link it to Theera
                    </p>
                </div>
                <div className='h-4'></div>
                <div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Input {...register('projectName', { required: true })} placeholder='Project Name' required />
                        <div className="h-2"></div>
                        <Input {...register('repoUrl', { required: true })} placeholder='Github URL' type='url' required />
                        <div className="h-2"></div>
                        <Input {...register('githubToken')} placeholder='Github Token (Optional)' />
                        {!!checkCredits.data && (
                            <>
                                <div className="mt-4 bg-orange-50 px-4 py-2 rounded-md border border-orange-200 text-orange-700">
                                    <div className="flex items-center gap-2">
                                        <Info className="size-4" />
                                        <p className="text-sm">You will be charged <strong>{checkCredits.data?.filecount}</strong> credits for this repository </p>
                                    </div>
                                    <p className="text-sm">You have <strong>{checkCredits.data?.userCredits}</strong> credits remaining </p>
                                </div>
                            </>)}
                        <div className="h-4"></div>
                        <Button disabled={createProject.isPending || checkCredits.isPending || !hasEnoughCredits} type='submit'>
                            {
                                !!checkCredits.data ? "Create Project" : "Check Credits"
                            }
                        </Button>
                    </form>
                </div>
            </div>

        </div>
    )
}

export default CreatePage
