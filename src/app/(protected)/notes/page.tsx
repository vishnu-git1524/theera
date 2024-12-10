'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import useProject from '@/hooks/use-project';
import { api } from '@/trpc/react';
import MDEditor from '@uiw/react-md-editor';
import { toast } from 'sonner'; // Correct import for toast library
import useRefetch from '@/hooks/use-refetch';

const NotesPage = () => {
  const { projectId } = useProject();
  const { data: notes = [], isLoading, error } = api.project.getNotes.useQuery(
    { projectId: projectId || '' }, // Ensure fallback to empty string to avoid undefined issues
    {
      enabled: !!projectId, // Only query if the `projectId` is valid
    }
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
  const [newNoteContent, setNewNoteContent] = useState<string>('');
  const [editNoteContent, setEditNoteContent] = useState<string>('');

  // Ensure mutations only proceed if data (like `projectId`) is valid
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
    // const confirmed = window.confirm('Are you sure you want to delete this note?');
    // if (!confirmed) return;

    toast.promise(
      deleteNote.mutateAsync({ noteId }).then(refetch),
      {
        loading: 'Deleting note...',
        success: 'Note deleted!',
        error: 'Failed to delete note.',
      }
    );
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
                <MDEditor.Markdown source={note.content} />
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedNote ? 'Edit Note' : 'Add New Note'}</DialogTitle>
          </DialogHeader>
          <MDEditor
            value={selectedNote ? editNoteContent : newNoteContent}
            onChange={(value = '') => selectedNote ? setEditNoteContent(value) : setNewNoteContent(value)} // Fixing type issue
            className="mb-4"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={selectedNote ? handleUpdateNote : handleAddNote}
            >
              {selectedNote ? 'Save Changes' : 'Add Note'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesPage;
