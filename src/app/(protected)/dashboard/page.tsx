'use client'

import useProject from '@/hooks/use-project'
import { ExternalLink, Github } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import CommitLog from './commit-log'
import AskQuestionCard from './ask-question'
import ArchiveButton from './archive-button'
// import InviteButton from './InviteButton'
import TeamMembers from './TeamMembers'
import dynamic from 'next/dynamic'
const InviteButton = dynamic(()=> import('./InviteButton'), {ssr: false})

const Dashboard = () => {
  const { project, projectId, projects } = useProject()

  // Check if a project is selected (if project is null or undefined, disable buttons)
  const isProjectSelected = project != null;

  return (
    <div>
      <div className='flex items-center justify-between flex-wrap gap-y-4'>
        <div className='w-fit rounded-md bg-primary px-4 py-3'>
          <div className='flex items-center'>
            <Github className='size-5 text-white' />
            <div className="ml-2">
              <p className='text-sm font-medium text-white'>
                This project is linked to {' '}
                <Link href={project?.githubUrl ?? ""} className='inline-flex items-center text-white/80 hover:underline'>
                  {project?.githubUrl}
                  <ExternalLink className='ml-1 size-4' />
                </Link>
              </p>
            </div>
          </div>
        </div>
        <div className="h-4"></div>
        <div className="flex items-center gap-4">
          <TeamMembers/>
          <InviteButton projectId={projectId} disabled={!isProjectSelected} />
          <ArchiveButton disabled={!isProjectSelected} />
        </div>
      </div>
      <div className="mt-4">
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-5'>
          <AskQuestionCard />
        </div>
      </div>
      <div className="mt-8">
        <CommitLog />
      </div>
    </div>
  )
}

export default Dashboard
