'use client'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import React from 'react'

const TeamMembers = () => {
  const { projectId } = useProject()
  const { data: members } = api.project.getTeamMembers.useQuery({ projectId })

  return (
    <div className="flex -space-x-2 overflow-hidden">
      {members?.map(member => (
        <img key={member.id}
          src={member.user.imageUrl || ""}
          alt={member.user.firstName || ""}
          height={30}
          width={30}
          className='inline-block h-8 w-8 rounded-full ring-2 ring-white'
        />
      ))}
    </div>
  )
}

export default TeamMembers
