'use client'

import { Button } from "@/components/ui/button"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { ArchiveRestore, Bot, CreditCard, LayoutDashboard, Plus, Presentation } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { redirect, usePathname, useRouter } from "next/navigation"
import useProject from "@/hooks/use-project"
import { toast } from "sonner"


const items = [
    {
        title: "Dashboard",
        url: '/dashboard',
        icon: LayoutDashboard
    },
    {
        title: "Q&A",
        url: '/qa',
        icon: Bot
    },
    // {
    //     title: "Meetings",
    //     url: '/meetings',
    //     icon: Presentation
    // },
    {
        title: "Billing",
        url: '/billing',
        icon: CreditCard
    },
    {
        title: "Archived",
        url: '/archived',
        icon: ArchiveRestore
    },
]

export function AppSideBar() {
    const pathname = usePathname()
    const { open } = useSidebar()
    const router = useRouter()
    const { projects, project, projectId, setProjectId, isLoading } = useProject()
    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <div className="flex items-center gap-4"> {/* Increase the gap value */}
                    <Image src='/logo.png' alt="logo" width={40} height={40} />
                    {open && (
                        <h1 className="text-xl font-bold text-primary/80">
                            Theera
                        </h1>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Application
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map(item => {
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <Link href={item.url} className={cn({
                                                'bg-primary text-white': pathname === item.url
                                            }, 'list-none')}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>
                        Your Projects
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {isLoading ? (
                                // Loading Spinner
                                <div className="flex justify-center items-center h-16">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                </div>
                            ) : (
                                projects?.map(project => (
                                    <SidebarMenuItem key={project.name}>
                                        <SidebarMenuButton asChild>
                                            <div
                                                onClick={() => {
                                                    setProjectId(project.id)
                                                    toast.success(`Selected Project - ${project.name}`)
                                                    router.push('/dashboard')
                                                }}
                                            >
                                                <div
                                                    className={cn(
                                                        'rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary',
                                                        {
                                                            'bg-primary text-white': project.id === projectId,
                                                        }
                                                    )}
                                                >
                                                    {project.name[0]}
                                                </div>
                                                <span>{project.name}</span>
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                            )}

                            <div className="h-2">
                                {open && (
                                    <SidebarMenuItem>
                                        <Link href={'/create'}>
                                            <Button size='sm' variant={'outline'} className="w-fit">
                                                <Plus />
                                                Create Project
                                            </Button>
                                        </Link>
                                    </SidebarMenuItem>
                                )}
                            </div>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}