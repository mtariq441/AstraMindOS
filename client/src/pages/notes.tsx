import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, StickyNote, Trash2, Edit2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Note, InsertNote } from "@shared/schema";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertNoteSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function Notes() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [tagInput, setTagInput] = useState("");
  const { toast } = useToast();

  const { data: notes, isLoading } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
  });

  const form = useForm<InsertNote>({
    resolver: zodResolver(insertNoteSchema.extend({
      title: insertNoteSchema.shape.title,
      content: insertNoteSchema.shape.content,
      tags: insertNoteSchema.shape.tags.optional(),
    })),
    defaultValues: {
      title: "",
      content: "",
      tags: [],
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: (data: InsertNote) => apiRequest<Note>("POST", "/api/notes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      setDialogOpen(false);
      setEditingNote(null);
      form.reset();
      setTagInput("");
      toast({
        title: "Note saved",
        description: "Your note has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Note> }) =>
      apiRequest<Note>("PATCH", `/api/notes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      setDialogOpen(false);
      setEditingNote(null);
      form.reset();
      setTagInput("");
      toast({
        title: "Note updated",
        description: "Your note has been updated successfully.",
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Note deleted",
        description: "Your note has been removed.",
      });
    },
  });

  const handleOpenDialog = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      form.reset({
        title: note.title,
        content: note.content,
        tags: note.tags || [],
      });
      setTagInput((note.tags || []).join(", "));
    } else {
      setEditingNote(null);
      form.reset({
        title: "",
        content: "",
        tags: [],
      });
      setTagInput("");
    }
    setDialogOpen(true);
  };

  const onSubmit = (data: InsertNote) => {
    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    
    const noteData = { ...data, tags };

    if (editingNote) {
      updateNoteMutation.mutate({ id: editingNote.id, data: noteData });
    } else {
      createNoteMutation.mutate(noteData);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-7xl p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Notes</h1>
            <p className="text-lg text-muted-foreground">
              Capture your thoughts and insights
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" onClick={() => handleOpenDialog()} data-testid="button-create-note">
                <Plus className="mr-2 h-5 w-5" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingNote ? "Edit Note" : "Create New Note"}</DialogTitle>
                <DialogDescription>
                  {editingNote ? "Update your note" : "Capture your thoughts and ideas"}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Meeting Notes"
                            data-testid="input-note-title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Write your note here..."
                            className="resize-none min-h-[200px]"
                            data-testid="input-note-content"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (optional)</Label>
                    <Input
                      id="tags"
                      placeholder="work, ideas, important (comma-separated)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      data-testid="input-note-tags"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={createNoteMutation.isPending || updateNoteMutation.isPending}
                      data-testid="button-submit-note"
                    >
                      {editingNote ? "Update Note" : "Create Note"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <StickyNote className="h-5 w-5 text-primary" />
                <div className="text-3xl font-bold" data-testid="stat-total-notes">
                  {notes?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Total Notes
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : notes?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <StickyNote className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-2xl font-bold mb-2">No notes yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Start capturing your thoughts, ideas, and important information
              </p>
              <Button onClick={() => handleOpenDialog()} data-testid="button-create-first-note-empty">
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Note
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <Card key={note.id} className="flex flex-col" data-testid={`note-${note.id}`}>
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight flex-1 min-w-0">
                      {note.title}
                    </CardTitle>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(note)}
                        className="h-8 w-8 p-0"
                        data-testid={`button-edit-note-${note.id}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNoteMutation.mutate(note.id)}
                        className="h-8 w-8 p-0"
                        data-testid={`button-delete-note-${note.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {note.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between gap-4">
                  <p className="text-sm text-muted-foreground line-clamp-6 whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
