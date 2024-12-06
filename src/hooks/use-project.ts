import { api } from '@/trpc/react'
import React from 'react'
import { useLocalStorage } from 'usehooks-ts'

const useProject = () => {
    const { data: projects, isLoading } = api.project.getProjects.useQuery()
    const [projectId, setProjectId] = useLocalStorage("theera-projectId", '')

    const project = projects?.find(project => project.id === projectId)

    return {
        projects,
        project,
        projectId,
        setProjectId,
        isLoading // Expose loading state
    }
}

export default useProject
