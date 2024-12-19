'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ArchiveRestore, Bot, CreditCard, LayoutDashboard, NotebookPen, Plus, Presentation, ChevronDown, ChevronUp, Github, PencilRuler, Info, FileText, Shield, BotMessageSquare, Bug, File, MessageSquareCode, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { redirect, usePathname, useRouter } from "next/navigation";
import useProject from "@/hooks/use-project";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import useRefetch from "@/hooks/use-refetch";
import ArchiveButton from "./dashboard/archive-button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DialogTitle } from "@/components/ui/dialog";

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

export function AppSideBar() {
    const pathname = usePathname();
    const { open } = useSidebar();
    const router = useRouter();
    const { projects, project, projectId, setProjectId, isLoading } = useProject();
    const refetch = useRefetch()
    const archiveProject = api.project.archiveProject.useMutation()
    const [dropdownState, setDropdownState] = useState<Record<string, boolean>>({});
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        setIsMobileMenuOpen(false);
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

    const SidebarContents = () => (
        <>
            <SidebarHeader>
                <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <div className="w-1"></div>
                        {open && (
                            <h1 className="text-xl font-bold text-primary/80">Theera</h1>
                        )}
                    </div>
                    {/* <Sheet>
                        <SheetTrigger asChild className="lg:hidden">
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </Button>
                        </SheetTrigger>
                    </Sheet> */}
                </div>
            </SidebarHeader>

            <SidebarContent>
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
                                                    <item.icon className="h-4 w-4" />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                            {item.subOptions && (
                                                <div
                                                    className="cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleDropdown(item.title);
                                                    }}
                                                >
                                                    {dropdownState[item.title] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
                                                            <subOption.icon className="h-4 w-4" />
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
                                                <div
                                                    className="cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleProjectMenu(project.id);
                                                        setProjectId(project.id)
                                                    }}
                                                >
                                                    {openProjects[project.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </div>
                                            </div>
                                        </SidebarMenuItem>
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
                                                <Plus className="h-4 w-4 mr-2" />
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
                                            <miscItem.icon className="h-4 w-4" />
                                            <span>{miscItem.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <Sidebar collapsible="icon" variant="floating">
                    <SidebarContents />
                </Sidebar>
            </div>

            {/* Mobile Sidebar */}
            <div className="lg:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="fixed top-4 left-4 z-50"
                            aria-label="Open menu"
                        >
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[280px] p-0">
                        <DialogTitle className="sr-only"></DialogTitle>
                        <SidebarContents />
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}