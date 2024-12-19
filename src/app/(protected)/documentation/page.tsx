'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Loader2 } from 'lucide-react';
import useProject from '@/hooks/use-project';
import { extractRepoInfo, fetchReadme, analyzeRepository, DocSection } from '@/lib/gemini';
import MDEditor from '@uiw/react-md-editor';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

const RepositoryAnalyzer = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [documentation, setDocumentation] = useState<string>(''); // Store raw markdown content
    const [readmeContent, setReadmeContent] = useState<string>(''); // Store the original README content
    const { project } = useProject();
    const documentationRef = useRef<HTMLDivElement>(null); // Reference for the content to be converted to PDF

    useEffect(() => {
        const loadReadme = async () => {
            if (project?.githubUrl) {
                const { owner, repo } = extractRepoInfo(project?.githubUrl!);
                try {
                    const readme = await fetchReadme(owner!, repo!);
                    setReadmeContent(readme); // Store the README content to be shown in markdown
                } catch (err) {
                    setError('Failed to load README file.');
                }
            }
        };

        loadReadme(); // Fetch README content when component mounts
    }, [project?.githubUrl]);

    const handleAnalyzeRepository = async () => {
        setLoading(true);
        setError('');
        setDocumentation('');

        try {
            const { owner, repo } = extractRepoInfo(project?.githubUrl!);
            const readme = await fetchReadme(owner!, repo!);
            const parsedSections = await analyzeRepository(readme, project?.name!);

            // Convert parsed sections to markdown format
            const markdownContent = parsedSections.map(section => {
                return `## ${section.title}\n\n${section.content}\n`;
            }).join("\n\n");

            setDocumentation(markdownContent); // Store the markdown content
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Function to download the markdown content as a PDF

    const handleDownload = () => {
        if (documentation) {
            try {
                // Convert Markdown content to plain text paragraphs
                const paragraphs = documentation.split('\n').map((line) => {
                    return new Paragraph({
                        children: [new TextRun(line)],
                    });
                });

                // Create a new Word document
                const doc = new Document({
                    sections: [
                        {
                            properties: {},
                            children: paragraphs,
                        },
                    ],
                });

                // Generate and save the Word document
                Packer.toBlob(doc).then((blob) => {
                    saveAs(blob, `${project?.name || 'documentation'}.docx`);
                });
            } catch (error) {
                console.error('Error generating DOCX:', error);
            }
        }
    };




    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-end mb-4">
                <Button onClick={handleAnalyzeRepository} disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Documentation
                        </>
                    ) : (
                        'Create Documentation'
                    )}
                </Button>
            </div>
            <div className="h-2"></div>
            <div className="bg-blue-50 px-4 py-2 rounded-md border border-blue-200 text-blue-700">
                <div className="flex items-center gap-2">
                    <Info className="size-4" />
                    <p className="text-sm">The documentation is generated based on the content of the repository's Readme.md file.</p>
                </div>
                <p className="text-sm">Ensure your repository includes a well-structured and informative Readme.md file for optimal results.</p>
            </div>


            {/* Error Alert */}
            {error && (
                <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Display README Markdown Before Generating Documentation */}
            {!documentation && readmeContent && (
                <Card className="w-full max-w-4xl mx-auto mt-8">
                    <CardHeader>
                        <CardTitle>Repository README</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Render README markdown */}
                        <MDEditor.Markdown source={readmeContent} />
                    </CardContent>
                </Card>
            )}

            {/* Display Generated Documentation After Creation */}
            {documentation && (
                <Card className="w-full max-w-4xl mx-auto mt-8">
                    <CardHeader>
                        <CardTitle>Generated Documentation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Render markdown of generated documentation */}
                        <div ref={documentationRef}>
                            <MDEditor.Markdown source={documentation} />
                        </div>

                        {/* Download PDF Button */}
                        <div className="flex justify-end mt-4">
                            <Button onClick={handleDownload} disabled={loading}>
                                Download
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default RepositoryAnalyzer;
