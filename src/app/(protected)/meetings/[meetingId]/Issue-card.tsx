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

export function IssueCard({ issue }: { issue: NonNullable<RouterOutputs["project"]["getMeetingById"]>["issues"][number] }) {
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
