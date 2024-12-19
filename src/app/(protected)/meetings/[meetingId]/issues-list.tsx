'use client'

import { Button } from '@/components/ui/button'
import { Presentation } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import { api } from '@/trpc/react'
import { IssueCard } from './Issue-card'

type Props = {
    meetingId: string
}

const IssuesList = ({ meetingId }: Props) => {
    const { data: meeting, isLoading } = api.project.getMeetingById.useQuery(
        { meetingId },
        {
            refetchInterval: 4000,
        }
    )
    if (isLoading || !meeting) return <div>Loading...</div>

    return (
        <div className="p-4 sm:p-6">
            <div className="mx-auto flex flex-col gap-6 max-w-xl items-center justify-between border-b pb-6 lg:mx-0 lg:max-w-none lg:flex-row">
                <div className="flex items-center gap-x-4">
                    <div className="rounded-full border bg-white p-3">
                        <Presentation className="h-7 w-7" />
                    </div>
                    <div>
                        <div className="text-sm leading-6 text-gray-500">
                            Meeting on{' '}
                            <span className="text-gray-700">
                                {meeting.createdAt.toLocaleString()}
                            </span>
                        </div>
                        <div className="mt-1 text-base font-semibold leading-6 text-gray-900">
                            {meeting.name}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-x-4">
                    <Button
                        variant="outline"
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href)
                            toast.success('Copied URL to clipboard')
                        }}
                    >
                        Copy URL
                    </Button>
                </div>
            </div>
            <div className="h-4"></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {meeting.issues.map((issue) => {
                    return <IssueCard issue={issue} key={issue.id} />
                })}
            </div>
        </div>
    )
}

export default IssuesList
