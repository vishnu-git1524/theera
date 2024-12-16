'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import { Archive } from 'lucide-react';
import useRefetch from '@/hooks/use-refetch';
import Link from 'next/link';

const Archived = () => {
    const [archivedProjects, setArchivedProjects] = useState<any[]>([]);
    const { data: archivedProjectsData, isLoading, isError, refetch } = api.project.getArchivedProjects.useQuery();

    const unarchiveMutation = api.project.unarchiveProject.useMutation({
        onSuccess: () => {
            toast.success('Project unarchived!');
            refetch();
        },
        onError: () => {
            toast.error('Error unarchiving project.');
        },
    });

    useEffect(() => {
        if (typeof window !== 'undefined' && archivedProjectsData) {
            setArchivedProjects(archivedProjectsData);
        }
    }, [archivedProjectsData]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-16">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (isError) {
        toast.error('Error loading archived projects.');
        return <div className="text-center text-red-500">Error loading archived projects</div>;
    }

    const handleUnarchive = (projectId: string) => {
        unarchiveMutation.mutate({ projectId });
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Archived Projects</h1>
            {archivedProjects.length === 0 ? (
                <p className="text-lg text-gray-600">No projects are archived.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {archivedProjects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col justify-between"
                        >
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {project.name}
                                </h3>
                                <div className="text-sm text-gray-700 mb-4">
                                    <span className="font-medium">GitHub URL:</span>{' '}
                                    <Link
                                        href={project.githubUrl}
                                        target="_blank"
                                        className="text-blue-500 hover:text-blue-700 break-all"
                                    >
                                        {project.githubUrl}
                                    </Link>
                                </div>
                                <div className="text-sm text-gray-500">
                                    <span className="font-medium">Archived:</span>{' '}
                                    {new Date(project.deletedAt).toLocaleDateString()}
                                </div>
                            </div>
                            <button
                                onClick={() => handleUnarchive(project.id)}
                                className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                <Archive className="mr-2 inline-block" />
                                Unarchive
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Archived;
