'use client'

import React, { useEffect, useState } from 'react';
import { api } from '@/trpc/react'; // Ensure this imports your trpc API correctly
import { toast } from 'sonner';
import { Archive } from 'lucide-react';
import useRefetch from '@/hooks/use-refetch';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

const Archived = () => {
    const [archivedProjects, setArchivedProjects] = useState<any[]>([]);
    const { data: archivedProjectsData, isLoading, isError, refetch } = api.project.getArchivedProjects.useQuery();

    // Use the mutation to unarchive a project
    const unarchiveMutation = api.project.unarchiveProject.useMutation({
        onSuccess: () => {
            toast.success('Project unarchived!');
            refetch(); // Refetch the archived projects after unarchive
        },
        onError: (error) => {
            toast.error('Error unarchiving project.');
        },
    });

    useEffect(() => {
        // Ensure this only runs on the client
        if (typeof window !== "undefined" && archivedProjectsData) {
          setArchivedProjects(archivedProjectsData);
        }
      }, [archivedProjectsData]);
      

    // Loading state
    if (isLoading) {
        return <div className="flex justify-center items-center h-16"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div></div>;
    }

    // Error state
    if (isError) {
        toast.error('Error loading archived projects.');
        return <div>Error loading archived projects</div>;
    }

    // Handle unarchive action
    const handleUnarchive = (projectId: string) => {
        unarchiveMutation.mutate({ projectId });
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Archived Projects</h1>
            {archivedProjects.length === 0 ? (
                <p className="text-lg text-gray-500">No projects are archived.</p>
            ) : (
                <div className="space-y-6">
                    {archivedProjects.map((project) => (
                        <div key={project.id} className="rounded-lg bg-white shadow-lg ring-1 ring-gray-200 p-6">
                            {/* Project Header */}
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-4">
                                    <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
                                </div>
                                <button
                                    onClick={() => handleUnarchive(project.id)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 focus:outline-none"
                                >
                                    <Archive className="mr-2 inline-block" />
                                    Unarchive
                                </button>
                            </div>

                            {/* Project Details */}
                            <div className="mt-4 space-y-3">
                                <div className="text-sm text-gray-700">
                                    <span className="font-semibold text-gray-900">GitHub URL: </span>
                                    <Link
                                        className="text-blue-500 hover:text-blue-700"
                                        href={project.githubUrl}
                                        target="_blank"
                                    >
                                        {project.githubUrl}
                                    </Link>
                                </div>
                                {/* Optionally display more information like last updated time */}
                                <div className="text-sm text-gray-500">
                                    <span className="font-semibold text-gray-900">Archived: </span>
                                    <span>{new Date(project.deletedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Archived;
