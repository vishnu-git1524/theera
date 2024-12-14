'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import { ExternalLink } from 'lucide-react';
import useProject from '@/hooks/use-project';
import { Button } from '@/components/ui/button';
import InviteButton from '../dashboard/InviteButton';

const TeamMembers = () => {
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const { projectId, project } = useProject();
    const { data: teamMembersData, isLoading, isError } = api.project.getTeamMembers.useQuery({ projectId });

    // Handle data population
    useEffect(() => {
        if (teamMembersData) {
            setTeamMembers(teamMembersData);
        }
    }, [teamMembersData]);

    // Handle loading state
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
            </div>
        );
    }

    // Handle error state
    if (isError) {
        toast.error('Error loading team members');
        return <div className="text-red-500 text-lg text-center mt-4">Failed to load team members.</div>;
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Team Members</h1>
                    <h3 className="text-lg text-gray-500">Project: {project?.name || 'Unknown Project'}</h3>
                </div>
                <div>
                    <InviteButton projectId={projectId} disabled={false} />
                </div>
            </div>

            {/* Team Members Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {teamMembers.length === 0 ? (
                    <div className="col-span-4 text-center text-gray-500 mt-8 text-lg">No team members found. Add members to get started.</div>
                ) : (
                    teamMembers.map((member) => (
                        <div
                            key={member.id}
                            className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 rounded-lg p-6 flex flex-col items-center justify-between border border-gray-200"
                        >
                            {/* Member Header with Image */}
                            <div className="flex flex-col items-center mb-6">
                                <img
                                    src={member.user.imageUrl || ''}
                                    alt={member.user.firstName}
                                    className="w-24 h-24 rounded-full object-cover mb-3"
                                />
                                <h3 className="text-xl font-semibold text-gray-800">{member.user.firstName}</h3>

                                {/* Display Admin label if the user is an admin */}
                                {member.isAdmin && (
                                    <span className="mt-2 text-sm text-white bg-green-600 rounded-full px-3 py-1">
                                        Admin
                                    </span>
                                )}
                            </div>

                            {/* Member Details */}
                            <div className="w-full flex flex-col items-center mt-auto space-y-4">
                                {member.user?.emailAddress && (
                                    <a
                                        href={`mailto:${member.user.emailAddress}`}
                                        className="text-blue-600 hover:text-blue-800 text-sm transition duration-200 flex items-center"
                                    >
                                        <ExternalLink className="inline-block mr-2" /> Contact
                                    </a>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toast.info(`Details for ${member.user?.firstName}`)}
                                    className="w-full"
                                >
                                    View Details
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TeamMembers;
