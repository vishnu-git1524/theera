'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import { ScanSearch, Upload } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { analyzeImage } from '@/lib/gemini';
import MDEditor from '@uiw/react-md-editor';
import Image from 'next/image'
import { api } from '@/trpc/react';
import useProject from '@/hooks/use-project';
import useRefetch from '@/hooks/use-refetch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { TrashIcon } from 'lucide-react';

const Analyze = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analyzedData, setAnalyzedData] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const saveAnalysis = api.project.saveAnalysis.useMutation()
  const { projectId, project } = useProject()
  const refetch = useRefetch()

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY_ISSUES!);
  const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-pro' });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif']
    },
    multiple: false,
    maxSize: 10_000_000, // 10MB
    onDrop: async (acceptedFiles) => {
      setIsUploading(true);
      const file = acceptedFiles[0];
      if (!file) return;

      try {
        const result = await analyzeImage(file, model);  // Use the analyzeImage function
        setAnalyzedData(result);
        setIsModalOpen(true);
        toast.success('Image analyzed successfully!');
      } catch (error) {
        toast.error('Failed to analyze image.');
      } finally {
        setIsUploading(false);
      }
    },
  });

  return (
    <>
      <Card className="col-span-2 flex flex-col items-center justify-center rounded-lg border bg-white p-10" {...getRootProps()}>
        {!isUploading && (
          <>
            <ScanSearch className="h-10 w-10 animate-bounce" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              Analyze an Image
            </h3>
            <p className="mt-1 text-center text-sm text-gray-500">
              Upload an image to analyze its content.
            </p>
            <div className="mt-6">
              <Button disabled={isUploading}>
                <Upload className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Upload Image
                <input disabled={isUploading} {...getInputProps()} />
              </Button>
            </div>
          </>
        )}
        {isUploading && (
          <div className="">
            <CircularProgressbar
              value={progress}
              text={`${Math.round(progress)}%`}
              className="size-20"
              styles={buildStyles({
                pathColor: '#2563eb',
                textColor: '#2563eb',
              })}
            />
            <p className="text-sm text-gray-500 text-center">Analyzing your image...</p>
          </div>
        )}
      </Card>

      <SavedAnalysisPage />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='sm:max-w-[80vw] max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <div className='flex items-center gap-2'>
              <DialogTitle>
                <Image src={'/logo.png'} alt='analysis-result' width={40} height={40} />
              </DialogTitle>
              <Button disabled={saveAnalysis.isPending} variant={'outline'} onClick={() => {
                saveAnalysis.mutate({
                  projectId: project!.id,
                  answer: analyzedData!,
                }, {
                  onSuccess: () => {
                    toast.success("Analysis data saved!");
                    refetch()

                  },
                  onError: () => {
                    toast.error("Failed to save Analysis")
                  }
                })
                setIsModalOpen(false);
              }}>Save Analysis</Button>
            </div>
          </DialogHeader>

          <MDEditor.Markdown
            className='rounded-md'
            source={analyzedData || "No data available."}
          />
          <Button type='button' onClick={() => { setIsModalOpen(false); }}>Close</Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

const SavedAnalysisPage = () => {
  const { projectId } = useProject();
  const { data: analyses, isLoading } = api.project.getAnalysis.useQuery({ projectId });
  const [selectedAnalysisIndex, setSelectedAnalysisIndex] = useState<number | null>(null);
  const selectedAnalysis = selectedAnalysisIndex !== null ? analyses?.[selectedAnalysisIndex] : null;

  return (
    <Sheet>
      <div className="my-4">
        <h1 className="text-2xl font-bold text-gray-900">Saved Analyses</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyses?.map((analysis, index) => (
            <SheetTrigger
              key={analysis.id}
              asChild
              onClick={() => setSelectedAnalysisIndex(index)}
            >
              <div className="bg-white rounded-lg shadow-lg border hover:shadow-xl transition-all cursor-pointer">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Analysis ID</h3>
                      <p className="text-sm text-gray-600">{analysis.id}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-800">Saved By</h4>
                    <p className="text-sm text-gray-600">{analysis.user.firstName}</p>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <Button variant={'outline'} size="sm" className="">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </SheetTrigger>
          ))}
        </div>
      )}

      {selectedAnalysis && (
        <SheetContent className="sm:max-w-[80vw] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Analysis Details</SheetTitle>
            <MDEditor.Markdown source={selectedAnalysis.answer || "No content available."} />
          </SheetHeader>
        </SheetContent>
      )}
    </Sheet>
  );
};


export default Analyze;