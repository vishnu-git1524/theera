'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import useProject from '@/hooks/use-project'
import Image from 'next/image'
import React from 'react'
import { askQuestion } from './action'
import MDEditor from '@uiw/react-md-editor'
import { readStreamableValue } from 'ai/rsc'
import CodeReferences from './code-references'
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import useRefetch from '@/hooks/use-refetch'

const AskQuestionCard = () => {
    const { projectId, project } = useProject()
    const [question, setQuestion] = React.useState('')
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [answer, setAnswer] = React.useState('')
    const [filesReferences, setFilesReferences] = React.useState<{ fileName: string; sourceCode: string; summary: string }[]>([])
    const saveAnswer = api.project.saveAnswer.useMutation()

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setAnswer('')
        setFilesReferences([])
        e.preventDefault()
        if (!project?.id) return
        setLoading(true)

        const { output, filesReferences } = await askQuestion(question, project.id)
        setOpen(true)
        setFilesReferences(filesReferences)

        for await (const delta of readStreamableValue(output)) {
            if (delta) {
                setAnswer(ans => ans + delta)
            }
        }
        setLoading(false)

    }
    const refetch = useRefetch()

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className='sm:max-w-[80vw] max-h-[90vh] overflow-y-auto'>
                    <DialogHeader>
                        <div className='flex items-center gap-2'>
                            <DialogTitle>
                                <Image src={'/logo.png'} alt='theera' width={40} height={40} />
                                {/* {question} */}
                            </DialogTitle>
                            <Button disabled={saveAnswer.isPending} variant={'outline'} onClick={() => {
                                saveAnswer.mutate({
                                    projectId: project!.id,
                                    question,
                                    answer,
                                    filesReferences
                                }, {
                                    onSuccess: () => {
                                        toast.success("Answer saved!")
                                        refetch()

                                    },
                                    onError: () => {
                                        toast.error("Failed to save answer")
                                    }
                                })
                            }}>Save Answer</Button>
                        </div>
                    </DialogHeader>
                    <MDEditor.Markdown
                        className='rounded-md'
                        source={answer}

                    />

                    <div className="h-4"></div>
                    <CodeReferences filesReferences={filesReferences} />
                    <Button type='button' onClick={() => { setOpen(false) }}>Close</Button>
                </DialogContent>
            </Dialog>
            <Card className='relative col-span-3'> {/* Prevent any blur effect here */}
                <CardHeader>
                    <CardTitle>Ask a question</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit}>
                        <Textarea placeholder='Which file should I edit to change the home page?' value={question} onChange={e => setQuestion(e.target.value)} />
                        <div className='h-4'></div>
                        <Button type='submit' disabled={loading}>
                            Ask Theera!
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    )
}

export default AskQuestionCard
