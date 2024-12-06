'use client'

import useProject from '@/hooks/use-project'
import { cn } from '@/lib/utils'
import { api } from '@/trpc/react'
import { ExternalLink, GitGraph, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { toast } from 'sonner'

const CommitLog = () => {
    const { projectId, project } = useProject()
    const { data: commits, refetch } = api.project.getCommits.useQuery({
        projectId
    })

    return (
        <>
            <div className="flex items-center mb-6 justify-between">
                <div className="flex items-center">
                    <GitGraph className="mr-2 h-6 w-6 text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-700">AI Commit Insights 🤖</h2>
                </div>
                {/* Refresh button */}
                <button 
                    className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
                    onClick={() => refetch().then(()=>  toast.success("Fetched..."))}  
                    // Refresh commits data when clicked
                >
                    <RefreshCw className="h-6 w-6 text-gray-600" />
                </button>
            </div>
            <ul className='space-y-6'>
                {commits?.map((commit, commitIdx) => {
                    return <li key={commit.id} className='relative flex gap-x-4'>
                        <div className={cn(
                            commitIdx === commits.length - 1 ? 'h-6' : '-bottom-6',
                            'absolute left-0 top-0 flex w-6 justify-center'
                        )}>

                            <div className='w-px translate-x-1 bg-gray-200'>

                            </div>

                        </div>
                        <>
                            <img src={commit.commitAuthorAvatar} alt="avatar" className='relative mt-4 size-8 flex-none rounded-full bg-gray-50' />
                            <div className='flex-auto rounded-md bg-white p-3 ring-1 ring-inset ring-gray-200'>
                                <div className='flex justify-between gap-x-4'>
                                    <Link className='py-0.5 text-xs leading-5 text-gray-500'
                                        target='_blank' href={`${project?.githubUrl}/commits/${commit.commitHash}`}>
                                        <span className='font-medium text-gray-900'>
                                            {commit.commitAuthorName}
                                        </span>{' '}
                                        <span className='inline-flex items-center'>
                                            committed
                                            <ExternalLink className='ml-1 size-4' />
                                        </span>
                                    </Link>
                                </div>
                                <span className='font-semibold'>
                                    {commit.commitMessage}
                                </span>
                                <pre className='mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-500'>
                                    {commit.summary}
                                </pre>
                            </div>
                        </>
                    </li>
                })}
            </ul>
        </>
    )
}

export default CommitLog
