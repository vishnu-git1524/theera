'use client'

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card'
import useProject from '@/hooks/use-project';
import { uploadFileToFirebase } from '@/lib/storage';
import { api } from '@/trpc/react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Presentation, Upload } from 'lucide-react';
import React, { useState } from 'react'
import { useDropzone } from "react-dropzone";
import { toast } from 'sonner';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar'
import { useRouter } from 'next/navigation';

const MeetingCard = () => {
    const { project, projectId, projects } = useProject()
    const processMeeting = useMutation({
        mutationFn: async (data: { meetingUrl: string, meetingId: string, projectId: string }) => {
            const { meetingUrl, meetingId, projectId } = data
            const response = await axios.post('/api/process-meeting', { meetingUrl, meetingId, projectId })
            return response.data
        }
    })
    const router = useRouter()
    const [isUploading, setIsUploading] = React.useState(false);
    const [progress, setProgress] = React.useState(0)
    const uploadMeeting = api.project.uploadMeeting.useMutation();
    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            "audio/*":
                [".mp3,.m4a,.wav,.flac,.ogg,.aac,.opus,.wma,.webm,.amr,.3gp,.mp2,.m2a,.m4b,.m4p,.mpc,.mpga,.oga,.spx,.wv,.mka,.m3u,.m3u8,.m4u"]

        },
        multiple: false,
        // 50mb
        maxSize: 50_000_000,
        onDrop: async acceptedFiles => {
            if (!project) return
            setIsUploading(true);
            console.log(acceptedFiles)
            const file = acceptedFiles[0];
            if (!file) return
            const downloadUrl = await uploadFileToFirebase(file as File, setProgress) as string
            uploadMeeting.mutate({
                meetingUrl: downloadUrl,
                projectId: project.id,
                name: file.name
            }, {
                onSuccess: (meeting) => {
                    toast.success("Meeting Uploaded Successfully")
                    router.push('/meetings');
                    processMeeting.mutateAsync({
                        meetingUrl: downloadUrl,
                        meetingId: meeting.id,
                        projectId: project.id
                    })
                },
                onError: () => {
                    toast.error("Failed to process meeting")
                }
            })
            setIsUploading(false);

        }
    })


    return (
        <Card className='col-span-2 flex flex-col items-center justify-center rounded-lg border bg-white p-10' {...getRootProps()}>
            {!isUploading && (
                <>
                    <Presentation className="h-10 w-10 animate-bounce" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">
                        Create a new meeting
                    </h3>
                    <p className="mt-1 text-center text-sm text-gray-500">
                        Analyse your meeting with Theera.
                        <br />
                        Powered by AI.
                    </p>
                    <div className="mt-6">
                        <Button disabled={isUploading || !project}>
                            <Upload className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                            Upload Meeting
                            <input disabled={isUploading || !project} {...getInputProps()} />
                        </Button>
                    </div>
                    {/* {isUploading && (
                        <p className="mt-3 text-center text-xs text-gray-500">
                            Uploading and processing meeting... <br />
                            This may take a few minutes...
                        </p>
                    )} */}
                </>
            )}
            {isUploading && (
                <div className=''>
                    <CircularProgressbar value={progress} text={`${Math.round(progress)}%`} className='size-20' styles={
                        buildStyles({
                            pathColor: '#2563eb',
                            textColor: '#2563eb'
                        })
                    } />
                    <p className='text-sm text-gray-500 text-center'>Uploading your meeting</p>
                </div>
            )}
        </Card>
    )
}

export default MeetingCard
