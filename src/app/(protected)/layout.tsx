'use client'

import { SidebarProvider } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import React, { useEffect, useState } from 'react'
import { AppSideBar } from './app-sidebar'
import useProject from '@/hooks/use-project'

type Props = {
  children: React.ReactNode
}

const SidebarLayout = ({ children }: Props) => {
  const { project, projectId, projects } = useProject()
  const [isClient, setIsClient] = useState(false)
  const [searchTerm, setSearchTerm] = useState('') // State for the search input

  useEffect(() => {
    setIsClient(true) // Mark when the client-side rendering is ready
  }, [])

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    console.log('Search term:', event.target.value) // Replace with your search logic
  }

  return (
    <SidebarProvider>
      <AppSideBar />
      <main className='w-full m-2'>
        <div className='flex items-center gap-2 border-sidebar-border bg-sidebar border shadow rounded-md p-2 px-4'>
          {/* Search bar */}
          <input
            type='text'
            placeholder='Search...'
            value={searchTerm}
            onChange={handleSearch}
            className='flex-1 bg-transparent border-none outline-none text-sm placeholder-gray-500'
          />
          {/* Conditional rendering to only load UserButton on client */}
          {isClient && <UserButton />}
        </div>
        <div className="h-4">
          {/* main content */}
        </div>
        <div className='border-sidebar-border bg-sidebar border shadow rounded-md overflow-y-scroll h-[calc(100vh-6rem)] p-4'>
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}

export default SidebarLayout
