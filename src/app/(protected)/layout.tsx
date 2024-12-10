'use client'

import { SidebarProvider } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import React, { useEffect, useState } from 'react'
import { AppSideBar } from './app-sidebar'
import useProject from '@/hooks/use-project'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// Define the shape of a Project
interface Project {
  name: string
  githubUrl: string
  id: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

type Props = {
  children: React.ReactNode
}

const SidebarLayout = ({ children }: Props) => {
  const { projects, setProjectId } = useProject()
  const [isClient, setIsClient] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])

  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (projects && searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      const filtered = projects.filter((proj) =>
        proj.name.toLowerCase().startsWith(term)
      )
      setFilteredProjects(filtered)
    } else {
      setFilteredProjects([])
    }
  }, [searchTerm, projects])

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleProjectClick = (projectId: string, projectName: string) => {
    setProjectId(projectId)
    toast.success(`Selected Project - ${projectName}`)
    router.push('/dashboard')
    setSearchTerm('')
  }

  // Function to render matching part of the search term in blue
  const renderMatchedText = (projectName: string, searchTerm: string) => {
    const matchIndex = projectName.toLowerCase().indexOf(searchTerm.toLowerCase())
    if (matchIndex === -1) return projectName // No match found

    return (
      <>
        <span className="text-blue-500">{projectName.substring(0, matchIndex + searchTerm.length)}</span>
        <span>{projectName.substring(matchIndex + searchTerm.length)}</span>
      </>
    )
  }

  return (
    <SidebarProvider>
      <AppSideBar />
      <main className="w-full m-2">
        <div className="relative flex items-center gap-2 border-sidebar-border bg-sidebar border shadow rounded-md p-2 px-4">
          {/* Search bar */}
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder-gray-500"
          />
          {isClient && <UserButton />}
          {/* Dropdown container for search results */}
          {searchTerm && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white shadow-lg border rounded-md z-10">
              {filteredProjects.length > 0 ? (
                <ul className="max-h-48 overflow-y-auto">
                  {filteredProjects.map((proj) => (
                    <li
                      key={proj.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleProjectClick(proj.id, proj.name)}
                    >
                      {renderMatchedText(proj.name, searchTerm)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-2 text-gray-500 text-sm">No results found</p>
              )}
            </div>
          )}
        </div>
        <div className="h-4"></div>
        <div className="border-sidebar-border bg-sidebar border shadow rounded-md overflow-y-scroll h-[calc(100vh-6rem)] p-4">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}

export default SidebarLayout
