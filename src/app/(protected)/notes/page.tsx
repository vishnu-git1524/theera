'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import useProject from '@/hooks/use-project';
import { api } from '@/trpc/react';
import MDEditor from '@uiw/react-md-editor';
import { toast } from 'sonner';
import useRefetch from '@/hooks/use-refetch';
import { Bot } from 'lucide-react';
import { askAutocomplete } from '@/lib/gemini';

const NotesPage = () => {
  const { projectId } = useProject();
  const { data: notes = [], isLoading, error } = api.project.getNotes.useQuery(
    { projectId: projectId || '' },
    { enabled: !!projectId }
  );
  const addNote = api.project.addNote.useMutation();
  const updateNote = api.project.updateNote.useMutation();
  const deleteNote = api.project.deleteNote.useMutation();
  const refetch = useRefetch();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<{
    id: string;
    content: string;
  } | null>(null);
  const [viewNoteContent, setViewNoteContent] = useState<string | null>(null);
  const [newNoteContent, setNewNoteContent] = useState<string>('');
  const [editNoteContent, setEditNoteContent] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);

  const handleAddNote = async () => {
    if (!projectId) {
      toast.error('No project selected. Please select a valid project.');
      return;
    }
    if (!newNoteContent.trim()) {
      toast.error('Note content cannot be empty.');
      return;
    }
    toast.promise(
      addNote.mutateAsync({ projectId, content: newNoteContent }).then(() => {
        setNewNoteContent('');
        setIsDialogOpen(false);
        refetch();
      }),
      {
        loading: 'Adding note...',
        success: 'Note added!',
        error: 'Failed to add note.',
      }
    );
  };

  const handleUpdateNote = async () => {
    if (!selectedNote?.id) {
      toast.error('Note is not selected for editing.');
      return;
    }

    if (!editNoteContent.trim()) {
      toast.error('Note content cannot be empty.');
      return;
    }

    toast.promise(
      updateNote.mutateAsync({ noteId: selectedNote.id, content: editNoteContent }).then(() => {
        setSelectedNote(null);
        setEditNoteContent('');
        setIsDialogOpen(false);
        refetch();
      }),
      {
        loading: 'Updating note...',
        success: 'Note updated!',
        error: 'Failed to update note.',
      }
    );
  };


  const handleDeleteNote = async (noteId: string) => {
    toast.promise(
      deleteNote.mutateAsync({ noteId }).then(refetch),
      {
        loading: 'Deleting note...',
        success: 'Note deleted!',
        error: 'Failed to delete note.',
      }
    );
  };

  const handleAutocompleteClick = async () => {
    const input = selectedNote ? editNoteContent : newNoteContent;
    if (!input.trim()) {
      toast.error('Input cannot be empty for AI autocomplete.');
      return;
    }
    setIsLoadingAI(true);
    try {
      const response = await askAutocomplete(input);
      if (selectedNote) {
        setEditNoteContent((prev) => prev + '\n' + response);
      } else {
        setNewNoteContent((prev) => prev + '\n' + response);
      }
    } catch (error) {
      console.error('Error with autocomplete:', error);
      toast.error('Failed to generate AI autocomplete response.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Project Notes</h1>
        <Button onClick={() => setIsDialogOpen(true)}>Add New Note</Button>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="spinner border-primary" />
        </div>
      ) : error ? (
        <div className="text-red-500">Failed to load notes. Please try again later.</div>
      ) : notes.length === 0 ? (
        <div className="text-center text-gray-500">No notes yet. Start by adding a new note!</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <CardTitle>{new Date(note.createdAt).toLocaleDateString()}</CardTitle>
                <CardDescription>
                  <Badge variant="secondary">Note ID: {note.id}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-24 overflow-hidden text-ellipsis">
                  <MDEditor.Markdown source={note.content.split('\n')[0] + '...'} />
                </div>

                <Button
                  size="sm"
                  variant="link"
                  onClick={() => setViewNoteContent(note.content)}
                >
                  View More
                </Button>
              </CardContent>
              <div className="flex justify-between px-4 py-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedNote({ id: note.id, content: note.content });
                    setEditNoteContent(note.content);
                    setIsDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteNote(note.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!viewNoteContent} onOpenChange={() => setViewNoteContent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Note Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <MDEditor preview='preview' height={400} value={viewNoteContent || ''} />
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setViewNoteContent(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedNote ? 'Edit Note' : 'Add New Note'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <MDEditor
              value={selectedNote ? editNoteContent : newNoteContent}
              onChange={(value = '') =>
                selectedNote ? setEditNoteContent(value) : setNewNoteContent(value)
              }
              height={400}
              className="border p-4 rounded-md"
              preview="edit"
            />
            <Button
              variant="outline"
              className="w-full mt-4 flex items-center justify-center gap-2"
              onClick={handleAutocompleteClick}
              disabled={isLoadingAI || !(selectedNote ? editNoteContent.trim() : newNoteContent.trim())}
            >
              <Bot className="text-xl" />
              {isLoadingAI ? 'Loading...' : 'AI Autocomplete'}
            </Button>

          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={selectedNote ? handleUpdateNote : handleAddNote}>
              {selectedNote ? 'Save Changes' : 'Add Note'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesPage;