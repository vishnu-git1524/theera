'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ArchiveRestore, Bot, CreditCard, LayoutDashboard, NotebookPen, Plus, Presentation, ChevronDown, ChevronUp, Github, PencilRuler, Info, FileText, Shield, BotMessageSquare, Bug, File, MessageSquareCode } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { redirect, usePathname, useRouter } from "next/navigation";
import useProject from "@/hooks/use-project";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import useRefetch from "@/hooks/use-refetch";
import ArchiveButton from "./dashboard/archive-button";

// Sidebar menu items and misc
const items = [
    {
        title: "Dashboard",
        url: '/dashboard',
        icon: LayoutDashboard
    },
    {
        title: "Documentation",
        url: '/documentation',
        icon: MessageSquareCode
    },
    {
        title: "Q&A",
        url: '/qa',
        icon: Bot
    },
    {
        title: "Meetings",
        url: '/meetings',
        icon: Presentation
    },
    {
        title: "Canvas",
        url: '/draw',
        icon: PencilRuler,
        subOptions: [
            {
                title: "AI Analyze",
                url: '/draw/analyze',
                icon: BotMessageSquare
            },
        ]
    },
    {
        title: "Notes",
        url: '/notes',
        icon: NotebookPen
    },
    {
        title: "Bugs",
        url: '/bugs',
        icon: Bug
    },
];

const misc = [
    {
        title: "Billing",
        url: '/billing',
        icon: CreditCard
    },
    {
        title: "Archived",
        url: '/archived',
        icon: ArchiveRestore
    }
];

// const legalItems = [
//     {
//         title: "About Theera",
//         url: '/about',
//         icon: Info
//     },
//     {
//         title: "Terms and Conditions",
//         url: '/terms',
//         icon: FileText
//     },
//     {
//         title: "Privacy Policy",
//         url: '/privacy',
//         icon: Shield
//     }
// ];

export function AppSideBar() {
    const pathname = usePathname();
    const { open } = useSidebar();
    const router = useRouter();
    const { projects, project, projectId, setProjectId, isLoading } = useProject();
    const refetch = useRefetch()
    const archiveProject = api.project.archiveProject.useMutation()
    const [dropdownState, setDropdownState] = useState<Record<string, boolean>>({});

    const toggleDropdown = (title: string) => {
        setDropdownState(prev => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

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

    // State to track the open/closed state of each project's sub-menu
    const [openProjects, setOpenProjects] = useState<Record<string, boolean>>({});

    const toggleProjectMenu = (projectId: string) => {
        setOpenProjects((prev) => ({
            ...prev,
            [projectId]: !prev[projectId],
        }));
    };

    const handleProjectSelection = (projectId: string, projectName: string) => {
        setProjectId(projectId);
        toast.success(`Selected Project - ${projectName}`);
        router.push('/dashboard');
    };

    const deletion = api.project.deleteProject.useMutation();

    const handleDelete = async () => {
        try {
            toast.promise(
                deletion.mutateAsync({
                    projectId
                }),
                {
                    loading: 'Deleting project...',
                    success: 'Project deleted successfully!',
                    error: 'Failed to delete project.',
                }
            );
            refetch();
        } catch (error) {
            console.error('Error occurred while deleting the project', error);
        }
    };

    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <div className="flex items-center gap-4">
                    <div className="w-1"></div>
                    {/* <Image src='/logo.svg' alt="logo" width={25} height={25} /> */}
                    {open && (
                        <h1  className="text-xl font-bold text-primary/80">Theera</h1>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent>
                {/* Application Group */}
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map(item => (
                                <div key={item.title}>
                                    <SidebarMenuItem>
                                        <div className="flex items-center justify-between w-full">
                                            <SidebarMenuButton asChild>
                                                <Link href={item.url} className={cn({
                                                    'bg-primary text-white': pathname === item.url
                                                }, 'list-none flex items-center gap-2')}>
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                            {item.subOptions && (
                                                <div
                                                    className="cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleDropdown(item.title); // Function to toggle dropdown state
                                                    }}
                                                >
                                                    {dropdownState[item.title] ? <ChevronUp /> : <ChevronDown />}
                                                </div>
                                            )}
                                        </div>
                                    </SidebarMenuItem>
                                    {item.subOptions && dropdownState[item.title] && (
                                        <div className="pl-8 space-y-2 bg-gray-50 py-2">
                                            {item.subOptions.map(subOption => (
                                                <SidebarMenuItem key={subOption.title}>
                                                    <SidebarMenuButton asChild>
                                                        <Link href={subOption.url} className={cn({
                                                            'bg-primary text-white': pathname === subOption.url
                                                        }, 'list-none flex items-center gap-2')}>
                                                            <subOption.icon />
                                                            <span>{subOption.title}</span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </SidebarMenu>

                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Project Group */}
                <SidebarGroup>
                    <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {isLoading ? (
                                <div className="flex justify-center items-center h-16">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                </div>
                            ) : (
                                projects?.map((project) => (
                                    <div key={project.id}>
                                        {/* Main Project Menu */}
                                        <SidebarMenuItem>
                                            <div className="flex items-center justify-between cursor-pointer px-2 py-1"
                                                onClick={() => handleProjectSelection(project.id, project.name)}>
                                                <div className="flex items-center">
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
                                                    <span className="ml-2">{project.name}</span>
                                                </div>
                                                {/* Arrow to toggle menu */}
                                                <div
                                                    className="cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleProjectMenu(project.id);
                                                        setProjectId(project.id)
                                                    }}
                                                >
                                                    {openProjects[project.id] ? <ChevronUp /> : <ChevronDown />}
                                                </div>
                                            </div>
                                        </SidebarMenuItem>
                                        {/* Sub-options - Collapsible Section */}
                                        {openProjects[project.id] && (
                                            <div className="pl-8 space-y-2 bg-gray-50 py-2">
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="w-full text-left"
                                                    onClick={() => handleDelete()}
                                                >
                                                    Delete
                                                </Button>
                                                {/* <ArchiveButton disabled={false} /> */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full text-left"
                                                    onClick={handleArchive}
                                                >
                                                    Archive
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full text-left"
                                                    onClick={() => redirect('/team')}
                                                >
                                                    View Team Members
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                            <div className="h-2"></div>
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

                <div className="h-4"></div>

                {/* Misc Group */}
                <SidebarGroup>
                    <SidebarGroupLabel>Misc</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {misc.map(miscItem => (
                                <SidebarMenuItem key={miscItem.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={miscItem.url} className={cn({
                                            'bg-primary text-white': pathname === miscItem.url
                                        }, 'list-none')}>
                                            <miscItem.icon />
                                            <span>{miscItem.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <div className="h-4"></div>

                {/* Legal Group */}
                {/* <SidebarGroup>
                    <SidebarGroupLabel>Legal</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {legalItems.map(item => (
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
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup> */}
            </SidebarContent>
        </Sidebar>
    );
}
