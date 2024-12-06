'use client'

import { Button } from '@/components/ui/button'
import useProject from '@/hooks/use-project'
import useRefetch from '@/hooks/use-refetch'
import { api } from '@/trpc/react'
import { Archive } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

type Props = {
  disabled: boolean; // Adding the 'disabled' prop
};

const ArchiveButton = ({ disabled }: Props) => {
  const archiveProject = api.project.archiveProject.useMutation()
  const { projectId } = useProject() // Assuming projectId is coming from useProject
  const refetch = useRefetch()

  const handleArchive = () => {
    const confirm = window.confirm("Are you sure you want to archive this project?")
    if (confirm) {
      archiveProject.mutate({ projectId }, {
        onSuccess: () => {
          toast.success("Project archived")
          refetch()
        },
        onError: () => {
          toast.error("Error archiving project")
        },
      })
    }
  }

  return (
    <Button 
      disabled={disabled || archiveProject.isPending}  // Disable button if disabled or mutation is pending
      size="sm" 
      variant="destructive" 
      onClick={handleArchive}
    >
      Archive
      <Archive />
    </Button>
  )
}

export default ArchiveButton
