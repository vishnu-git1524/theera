'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import useProject from '@/hooks/use-project';
import { api } from '@/trpc/react';
import MDEditor from '@uiw/react-md-editor';
import { toast } from 'sonner';
import useRefetch from '@/hooks/use-refetch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Info, Plus } from 'lucide-react';

const BugsPage = () => {
  const { projectId } = useProject();
  const { data: bugs = [], isLoading, error } = api.project.getAllBugs.useQuery(
    { projectId: projectId || '' },
    { enabled: !!projectId }
  );
  const addBug = api.project.addBug.useMutation();
  const updateBug = api.project.updateBug.useMutation();
  const deleteBug = api.project.deleteBug.useMutation();
  const refetch = useRefetch();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBug, setSelectedBug] = useState<{
    id: string;
    title: string;
    description: string;
    status: 'PENDING' | 'FIXED';
  } | null>(null);
  const [viewBugDescription, setViewBugDescription] = useState<string | null>(null);
  const [newBugTitle, setNewBugTitle] = useState<string>('');
  const [newBugDescription, setNewBugDescription] = useState<string>('');
  const [editBugTitle, setEditBugTitle] = useState<string>('');
  const [editBugDescription, setEditBugDescription] = useState<string>('');
  const [editBugStatus, setEditBugStatus] = useState<'PENDING' | 'FIXED'>('PENDING');
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);

  // Reset fields when opening the dialog for a new bug
  useEffect(() => {
    if (!selectedBug) {
      setNewBugTitle('');
      setNewBugDescription('');
      setEditBugTitle('');
      setEditBugDescription('');
      setEditBugStatus('PENDING');
    }
  }, [selectedBug]);

  const handleAddBug = async () => {
    if (!projectId) {
      toast.error('No project selected. Please select a valid project.');
      return;
    }
    if (!newBugTitle.trim() || !newBugDescription.trim()) {
      toast.error('Bug title and description cannot be empty.');
      return;
    }
    toast.promise(
      addBug.mutateAsync({ projectId, title: newBugTitle, description: newBugDescription }).then(() => {
        setNewBugTitle('');
        setNewBugDescription('');
        setIsDialogOpen(false);
        refetch();
      }),
      {
        loading: 'Adding bug...',
        success: 'Bug added!',
        error: 'Failed to add bug.',
      }
    );
  };

  const handleUpdateBug = async () => {
    if (!selectedBug?.id) {
      toast.error('Bug is not selected for editing.');
      return;
    }

    if (!editBugTitle.trim() || !editBugDescription.trim()) {
      toast.error('Bug title and description cannot be empty.');
      return;
    }

    toast.promise(
      updateBug.mutateAsync({
        bugId: selectedBug.id,
        title: editBugTitle,
        description: editBugDescription,
        status: editBugStatus,
      }).then(() => {
        setSelectedBug(null);
        setEditBugTitle('');
        setEditBugDescription('');
        setEditBugStatus('PENDING');
        setIsDialogOpen(false);
        refetch();
      }),
      {
        loading: 'Updating bug...',
        success: 'Bug updated!',
        error: 'Failed to update bug.',
      }
    );
  };

  const handleDeleteBug = async (bugId: string) => {
    toast.promise(
      deleteBug.mutateAsync({ bugId }).then(refetch),
      {
        loading: 'Deleting bug...',
        success: 'Bug deleted!',
        error: 'Failed to delete bug.',
      }
    );
  };

  return (
    <div className="space-y-6 p-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Project Bugs</h1>
        <Button onClick={() => {
          setSelectedBug(null); // Ensure it's set to null when adding a new bug
          setIsDialogOpen(true);
        }}>Add New Bug  <Plus/> </Button>
      </header>

      <div className="bg-blue-50 px-4 py-2 rounded-md border border-blue-200 text-blue-700">
                <div className="flex items-center gap-2">
                    <Info className="size-4" />
                    <p className="text-sm font-semibold">These bugs do not align with those found in GitHub.</p>
                </div>
            </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="spinner border-primary" />
        </div>
      ) : error ? (
        <div className="text-red-500">Failed to load bugs. Please try again later.</div>
      ) : bugs.length === 0 ? (
        <div className="text-center text-gray-500">No bugs yet. Start by adding a new bug!</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {bugs.map((bug) => (
            <Card key={bug.id} className="border-2 border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-blue-50 p-4 rounded-t-lg">
                <CardTitle className="text-xl font-semibold">{bug.title}</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  <div className="h-2"></div>
                  <Badge variant={bug.status === 'PENDING' ? 'destructive' : 'default'} className="mr-2">
                    {bug.status}
                  </Badge>
                  <div className="h-2"></div>
                  <p className="text-xs">Raised By: <span className='text font-bold'>{bug.user.firstName}</span> </p>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <div className="max-h-24 overflow-hidden text-ellipsis">
                  <MDEditor.Markdown source={bug.description.split('\n')[0] + '...'} />
                </div>
                <Button
                  size="sm"
                  variant="link"
                  onClick={() => setViewBugDescription(bug.description)}
                  className="text-blue-600 hover:underline"
                >
                  View More
                </Button>
              </CardContent>
              <div className="flex justify-between px-4 py-2 bg-gray-50 rounded-b-lg">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedBug({
                      id: bug.id,
                      title: bug.title,
                      description: bug.description,
                      status: bug.status,
                    });
                    setEditBugTitle(bug.title);
                    setEditBugDescription(bug.description);
                    setEditBugStatus(bug.status);
                    setIsDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteBug(bug.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog for bug preview */}
      <Dialog open={!!viewBugDescription} onOpenChange={() => setViewBugDescription(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bug Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <MDEditor preview="preview" height={200} value={viewBugDescription || ''} />
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setViewBugDescription(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for adding or editing bug */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedBug ? 'Edit Bug' : 'Add New Bug'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="text"
              className="w-full border p-2 rounded-md"
              placeholder="Bug Title"
              value={selectedBug ? editBugTitle : newBugTitle}
              onChange={(e) =>
                selectedBug ? setEditBugTitle(e.target.value) : setNewBugTitle(e.target.value)
              }
            />
            <MDEditor
              value={selectedBug ? editBugDescription : newBugDescription}
              onChange={(value = '') =>
                selectedBug ? setEditBugDescription(value) : setNewBugDescription(value)
              }
              height={200}
              className="border p-4 rounded-md"
              preview="edit"
            />
            <Select value={editBugStatus} onValueChange={(value) => setEditBugStatus(value as 'PENDING' | 'FIXED')}>
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">PENDING</SelectItem>
                <SelectItem value="FIXED">FIXED</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={selectedBug ? handleUpdateBug : handleAddBug}>
              {selectedBug ? 'Save Changes' : 'Add Bug'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BugsPage;
