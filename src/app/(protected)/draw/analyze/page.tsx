'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import { Image, Upload } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { analyzeImage } from '@/lib/gemini';

const Analyze = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analyzedData, setAnalyzedData] = useState<string | null>(null);

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
        toast.success('Image analyzed successfully!');
      } catch (error) {
        toast.error('Failed to analyze image.');
      } finally {
        setIsUploading(false);
      }
    },
  });

  return (
    <Card className="col-span-2 flex flex-col items-center justify-center rounded-lg border bg-white p-10" {...getRootProps()}>
      {!isUploading && (
        <>
          <Image className="h-10 w-10 animate-bounce" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            Analyze an Image
          </h3>
          <p className="mt-1 text-center text-sm text-gray-500">
            Upload an image to analyze its content.
            <br />
            Powered by Gemini API.
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
          <p className="text-sm text-gray-500 text-center">Uploading and analyzing your image...</p>
        </div>
      )}
      {analyzedData && (
        <div className="mt-6 w-full">
          <h4 className="text-lg font-semibold text-gray-900">Analysis Result:</h4>
          <p className="mt-2 text-sm text-gray-700">{analyzedData}</p>
        </div>
      )}
    </Card>
  );
};

export default Analyze;
