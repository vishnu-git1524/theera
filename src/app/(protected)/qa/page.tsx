'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import React from 'react'
import AskQuestionCard from '../dashboard/ask-question'
import MDEditor from '@uiw/react-md-editor'
import CodeReferences from '../dashboard/code-references'
import { toast } from 'sonner'
import { TrashIcon } from 'lucide-react'
import useRefetch from '@/hooks/use-refetch'
import { redirect } from 'next/navigation'

const QAPage = () => {
  const { projects, project, projectId, setProjectId, isLoading } = useProject()
  const { data: questions, isLoading: isQuestionsLoading } = api.project.getQuestions.useQuery({ projectId })
  const [questionIndex, setQuestionIndex] = React.useState(0)
  const deleteQuestion = api.project.deleteQuestion.useMutation();
  const question = questions?.[questionIndex]
  const refetch = useRefetch()

  return (
    <Sheet>
      <AskQuestionCard />
      <div className="h-4"></div>
      <h1 className='text-xl font-semibold'>Saved Questions</h1>
      <div className="h-2"></div>

      {isQuestionsLoading ? (
        <div className="flex justify-center items-center h-24">
          <div className="flex justify-center items-center h-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      ) : (
        <div className='flex flex-col gap-2'>
          {questions?.map((question, index) => (
            <React.Fragment key={question.id}>
              <SheetTrigger onClick={() => setQuestionIndex(index)}>
                <div className='flex items-center gap-4 bg-white rounded-lg p-4 shadow border'>
                  <img className='rounded-full' height={30} width={30} src={question.user.imageUrl ?? ""} alt="user" />
                  <div className='text-left flex flex-col flex-grow'>
                    <div className='flex items-center gap-2'>
                      <p className='text-gray-700 line-clamp-1 text-lg font-medium'>
                        {question.question}
                      </p>
                      <span className='text-xs text-gray-400 whitespace-nowrap ml-auto'>
                        {question.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className='text-gray-500 line-clamp-1 text-sm'>
                      {question.answer}
                    </p>
                  </div>
                  <span className="ml-auto flex items-center">
                    <TrashIcon
                      onClick={(e) => {
                        e.stopPropagation();
                        const confirm = window.confirm(
                          "Are you sure you want to delete this question?",
                        );
                        if (!confirm) return;
                        toast.promise(
                          deleteQuestion.mutateAsync({
                            questionId: question.id,
                          }),
                          {
                            loading: "Deleting...",
                            error: "Failed to delete question",
                            success: () => {
                              refetch()
                              return "Deleted!";
                            },
                          },
                        );
                      }}
                      className="h-5 w-5 text-red-600"
                    />
                  </span>
                </div>

              </SheetTrigger>
            </React.Fragment>
          ))}
        </div>
      )}

      {question && (
        <SheetContent className="sm:max-w-[80vw] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{question.question}</SheetTitle>
            <MDEditor.Markdown source={question.answer} />
            <CodeReferences filesReferences={(question.filesReferences ?? []) as any} />
          </SheetHeader>
        </SheetContent>
      )}
    </Sheet>
  )
}

export default QAPage
