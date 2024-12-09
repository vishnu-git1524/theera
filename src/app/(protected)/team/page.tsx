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
                    <h1 className="text-3xl font-bold text-gray-800">Team Members</h1>
                    <h3 className="text-lg text-gray-500">Working with: {project?.name || 'Unknown Project'}</h3>
                </div>
                <div>
                    <InviteButton projectId={projectId} disabled={false} />
                </div>
            </div>

            {/* Team Members Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {teamMembers.length === 0 ? (
                    <div className="col-span-4 text-center text-gray-500 mt-8 text-lg">No team members found. Add members to get started.</div>
                ) : (
                    teamMembers.map((member) => (
                        <div
                            key={member.id}
                            className="bg-white shadow-lg hover:shadow-2xl transition-shadow duration-200 rounded-lg p-4 flex flex-col items-start justify-between"
                        >
                            {/* Member Header with Image */}
                            <div className="flex items-center w-full space-x-4 mb-4">
                                <img
                                    src={member.user.imageUrl || ''}
                                    alt={member.user.firstName}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">{member.user.firstName}</h3>
                                    {/* {member.role && <p className="text-sm text-gray-600 mt-1">{member.role}</p>} */}
                                </div>
                            </div>
                            {/* Member Details or actions */}
                            <div className="w-full flex justify-between items-center mt-auto">
                                {member.user?.emailAddress && (
                                    <a
                                        href={`mailto:${member.user.emailAddress}`}
                                        className="text-blue-500 hover:text-blue-700 text-sm transition duration-200"
                                    >
                                        Contact
                                    </a>
                                )}
                                <button
                                    className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-sm text-blue-700 rounded-md transition duration-200"
                                    onClick={() => toast.info(`Details for ${member.user?.firstName}`)}
                                >
                                    Details
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TeamMembers;
