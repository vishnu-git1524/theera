'use client'

import React, { useEffect, useState } from 'react';
import { api } from '@/trpc/react'; // Ensure this imports your trpc API correctly
import { toast } from 'sonner';
import { ExternalLink } from 'lucide-react';
import useProject from '@/hooks/use-project';

const TeamMembers = () => {
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const { projectId, project } = useProject(); // Assuming projectId is passed down via useProject
    const { data: teamMembersData, isLoading, isError, refetch } = api.project.getTeamMembers.useQuery({ projectId });

    // Handle success or error on the team members query
    useEffect(() => {
        if (teamMembersData) {
            setTeamMembers(teamMembersData);
        }
    }, [teamMembersData]);

    // Loading state
    if (isLoading) {
        return <div className="flex justify-center items-center h-16"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div></div>;
    }

    // Error state
    if (isError) {
        toast.error('Error loading team members.');
        return <div>Error loading team members</div>;
    }

    return (
        <div className="p-6">
            <div className="flex items-center space-x-4 mb-6">
                <h1 className="text-2xl font-bold">Team Members</h1>
                <h3 className="text-lg text-gray-600">- {project?.name}</h3>
            </div>

            {teamMembers.length === 0 ? (
                <p className="text-lg text-gray-500">No team members available.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {teamMembers?.map((member) => (
                        <div key={member.id} className="bg-white shadow-lg rounded-lg p-4">
                            <div className="flex items-center space-x-4">
                                <img
                                    src={member.user.imageUrl || '/default-avatar.png'} // Use a default avatar if no image is provided
                                    alt={member.user.firstName}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">{member.user.firstName}</h3>
                                    {/* <p className="text-sm text-gray-500">{member.role}</p> */}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeamMembers;
