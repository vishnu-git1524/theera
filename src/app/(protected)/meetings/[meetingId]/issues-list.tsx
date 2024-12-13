'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { api, RouterOutputs } from '@/trpc/react'
// import { Dialog, DialogContent, DialogTitle } from '@radix-ui/react-dialog'
import { Presentation } from 'lucide-react'
import React, { useState } from 'react'
import Modal from '../../dashboard/Modal'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { askIssue } from '@/lib/gemini'

type Props = {
    meetingId: string
}

const IssuesList = ({ meetingId }: Props) => {
    const { data: meeting, isLoading } = api.project.getMeetingById.useQuery({ meetingId }, {
        refetchInterval: 4000
    })
    if (isLoading || !meeting) return <div>Loading...</div>
    return (
        <>
            <div className="p-6">
                <div className="mx-auto flex max-w-2xl items-center justify-between gap-x-8 border-b pb-10 lg:mx-0 lg:max-w-none">
                    <div className="flex items-center gap-x-6">
                        {/* <img
              src="https://tailwindui.com/img/logos/48x48/tuple.svg"
              alt=""
              className="flex-none w-16 h-16 rounded-full ring-1 ring-gray-900/10"
            /> */}
                        <div className="rounded-full border bg-white p-3">
                            <Presentation className="h-7 w-7 " />
                        </div>
                        <h1>
                            <div className="text-sm leading-6 text-gray-500">
                                Meeting on{" "}
                                <span className="text-gray-700">
                                    {meeting.createdAt.toLocaleString()}
                                </span>
                            </div>
                            <div className="mt-1 text-base font-semibold leading-6 text-gray-900">
                                {meeting.name}
                            </div>
                        </h1>
                    </div>
                    <div className="flex items-center gap-x-4 sm:gap-x-6">
                        <Button
                            variant='outline'
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                toast.success("Copied URL to clipboard");
                            }}
                        >
                            Copy URL
                        </Button>
                    </div>
                </div>
                <div className="h-4"></div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {meeting.issues.map((issue) => {
                        return <IssueCard issue={issue} key={issue.id} />;
                    })}
                </div>
            </div>
        </>
    )
}

function IssueCard({ issue }: { issue: NonNullable<RouterOutputs["project"]["getMeetingById"]>["issues"][number] }) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [answer, setAnswer] = React.useState("");

    // Reset the answer when the modal is closed
    React.useEffect(() => {
        if (!open) {
            setAnswer("");  // Reset the answer when modal is closed
            setQuery("")
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            if (!query) return toast.error("Enter any Question");
            // toast.info("Sending question to Gemini...");

            const response = await askIssue(query, issue.summary);
            setQuery("");
            triggerAnswerStream(response);
        } catch (error) {
            toast.error("Failed to get a response");
        }
    };

    const triggerAnswerStream = React.useCallback((answer: string) => {
        let i = 0;
        const interval = setInterval(() => {
            setAnswer(answer.slice(0, i));
            i++;
            if (i > answer.length) {
                clearInterval(interval);
            }
        }, 6);
    }, []);

    return (
        <>
            <Modal open={open} setOpen={setOpen}>
                <h1 className="text-lg font-semibold text-gray-800">{issue.gist}</h1>
                <span className="text-sm text-gray-500">
                    {issue.createdAt.toDateString()}
                </span>
                <div className="h-3"></div>
                <p className="text-gray-600">{issue.headline}</p>
                <div className="h-2"></div>
                <blockquote className="mt-2 border-l-4 border-gray-300 bg-gray-50 p-4 dark:border-gray-500 dark:bg-gray-800">
                    <span className="text-sm text-gray-600">
                        {issue.start} - {issue.end}
                    </span>
                    <p className="font-medium italic leading-relaxed text-gray-900 dark:text-white">
                        {issue.summary}
                    </p>
                </blockquote>
                <form className="mt-4" onSubmit={handleSubmit}>
                    <div>
                        <Label>Ask for further clarification...</Label>
                        <Input
                            className="mt-1"
                            placeholder="What did you mean by..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <span className="text-xs text-gray-500">
                            Theera has context about this issue and the meeting
                        </span>
                        {answer && (
                            <>
                                <p className="mt-2 text-xs font-semibold">Answer</p>
                                <pre className="whitespace-pre-wrap text-sm">{answer}</pre>
                            </>
                        )}
                    </div>
                    <Button className="mt-3 w-full">
                        Send Question
                    </Button>
                </form>
            </Modal>
            <Card className="relative">
                <CardHeader>
                    <CardTitle className="text-xl">{issue.gist}</CardTitle>
                    <div className="border-b"></div>
                    <CardDescription>{issue.headline}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-4"></div>
                    <Button
                        onClick={() => setOpen(true)}
                        className="absolute bottom-4 left-4"
                    >
                        Details
                    </Button>
                </CardContent>
            </Card>
        </>
    );
}

export default IssuesList
