'use client'

import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import React from 'react'
import MeetingCard from '../dashboard/meeting-card'
import { toast } from 'sonner'
import useRefetch from '@/hooks/use-refetch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Trash2, Eye } from 'lucide-react' // Import relevant icons

const MeetingsPage = () => {
    const { projectId } = useProject()
    const { data: meetings, isLoading } = api.project.getMeetings.useQuery(
        { projectId },
        {
            refetchInterval: 4000,
        }
    )

    const refetch = useRefetch()
    const deleteMeeting = api.project.deleteMeeting.useMutation()

    return (
        <>
            <MeetingCard />
            <div className="h-6"></div>
            <h1 className="text-xl font-semibold">Meetings</h1>
            {meetings && meetings.length === 0 && <div>No meetings found</div>}
            {isLoading && <div>Loading...</div>}
            <ul role="list" className="divide-y divide-gray-200">
                {meetings?.map((meeting) => (
                    <li
                        key={meeting.id}
                        className="flex items-center justify-between py-5 gap-x-6"
                    >
                        <div className="min-w-0">
                            <div className="flex items-start gap-x-3">
                                <Link
                                    href={`/meeting/${meeting.id}`}
                                    className="text-sm font-semibold leading-6 text-gray-900 hover:underline"
                                >
                                    {meeting.name}
                                </Link>
                                {meeting.status === 'PROCESSING' && (
                                    <Badge className="bg-yellow-500 text-white">
                                        Processing...
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center mt-1 text-xs leading-5 text-gray-500 gap-x-2">
                                <p className="whitespace-nowrap">
                                    <time dateTime={meeting.createdAt.toLocaleDateString()}>
                                        {meeting.createdAt.toLocaleDateString()}
                                    </time>
                                </p>
                                <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                                    <circle cx={1} cy={1} r={1} />
                                </svg>
                                <p className="truncate">{meeting.issues.length} issues</p>
                            </div>
                        </div>
                        <div className="flex items-center flex-none gap-x-4">
                            {/* Show icons on mobile and buttons on larger screens */}
                            <div className="hidden sm:flex gap-x-4">
                                <Link href={`/meetings/${meeting.id}`}>
                                    <Button size="sm" variant="outline">
                                        View meeting
                                    </Button>
                                </Link>
                                <Button
                                    disabled={deleteMeeting.isPending}
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                        deleteMeeting.mutate(
                                            { meetingId: meeting.id },
                                            {
                                                onSuccess: () => {
                                                    toast.success('Meeting deleted successfully')
                                                    refetch()
                                                },
                                            }
                                        )
                                    }
                                >
                                    Delete Meeting
                                </Button>
                            </div>
                            <div className="flex sm:hidden gap-x-2">
                                <Link href={`/meetings/${meeting.id}`}>
                                    <Button variant="ghost" size="icon">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Button
                                    disabled={deleteMeeting.isPending}
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                        deleteMeeting.mutate(
                                            { meetingId: meeting.id },
                                            {
                                                onSuccess: () => {
                                                    toast.success('Meeting deleted successfully')
                                                    refetch()
                                                },
                                            }
                                        )
                                    }
                                >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </>
    )
}

export default MeetingsPage
