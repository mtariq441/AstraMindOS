import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Target, CheckCircle2, Clock, Trash2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Goal, InsertGoal } from "@shared/schema";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGoalSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const categories = ["productivity", "learning", "health", "finance", "personal", "career"];

export default function Goals() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: goals, isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const form = useForm<InsertGoal>({
    resolver: zodResolver(insertGoalSchema.extend({
      title: insertGoalSchema.shape.title,
      description: insertGoalSchema.shape.description.optional(),
      category: insertGoalSchema.shape.category,
      progress: insertGoalSchema.shape.progress.optional().default(0),
      targetDate: insertGoalSchema.shape.targetDate.optional(),
      completed: insertGoalSchema.shape.completed.optional().default(false),
    })),
    defaultValues: {
      title: "",
      description: "",
      category: "productivity",
      progress: 0,
      completed: false,
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: (data: InsertGoal) => apiRequest<Goal>("POST", "/api/goals", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Goal created",
        description: "Your new goal has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Goal> }) =>
      apiRequest<Goal>("PATCH", `/api/goals/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Goal updated",
        description: "Your goal has been updated successfully.",
      });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/goals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal deleted",
        description: "Your goal has been removed.",
      });
    },
  });

  const onSubmit = (data: InsertGoal) => {
    createGoalMutation.mutate(data);
  };

  const activeGoals = goals?.filter((g) => !g.completed) || [];
  const completedGoals = goals?.filter((g) => g.completed) || [];

  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-7xl p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Goals</h1>
            <p className="text-lg text-muted-foreground">
              Track your progress and achieve your targets
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" data-testid="button-create-goal">
                <Plus className="mr-2 h-5 w-5" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
                <DialogDescription>
                  Set a new target and track your progress
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
                            placeholder="e.g., Learn React"
                            data-testid="input-goal-title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add more details about your goal..."
                            className="resize-none"
                            rows={3}
                            data-testid="input-goal-description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-goal-category">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="targetDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Date (optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            data-testid="input-goal-target-date"
                            {...field}
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={createGoalMutation.isPending}
                      data-testid="button-submit-goal"
                    >
                      Create Goal
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-3xl font-bold" data-testid="stat-total-goals">{goals?.length || 0}</div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Total Goals
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-600 dark:text-blue-500" />
                <div>
                  <div className="text-3xl font-bold" data-testid="stat-active-goals">{activeGoals.length}</div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Active
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
                <div>
                  <div className="text-3xl font-bold" data-testid="stat-completed-goals">{completedGoals.length}</div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Completed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Active Goals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeGoals.map((goal) => (
                <Card key={goal.id} className="overflow-visible" data-testid={`goal-${goal.id}`}>
                  <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
                    <div className="flex-1 min-w-0 space-y-1">
                      <CardTitle className="text-lg leading-tight">{goal.title}</CardTitle>
                      {goal.description && (
                        <CardDescription className="line-clamp-2">
                          {goal.description}
                        </CardDescription>
                      )}
                    </div>
                    <Badge variant="secondary">{goal.category}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateGoalMutation.mutate({
                                id: goal.id,
                                data: { progress: Math.max(0, goal.progress - 10) },
                              })
                            }
                            className="h-6 w-6 p-0"
                            data-testid={`button-decrease-progress-${goal.id}`}
                          >
                            -
                          </Button>
                          <span className="font-mono font-medium min-w-[3ch] text-center">
                            {goal.progress}%
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateGoalMutation.mutate({
                                id: goal.id,
                                data: { progress: Math.min(100, goal.progress + 10) },
                              })
                            }
                            className="h-6 w-6 p-0"
                            data-testid={`button-increase-progress-${goal.id}`}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                    {goal.targetDate && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className="font-mono">
                          Target: {format(new Date(goal.targetDate), "MMM d, yyyy")}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          updateGoalMutation.mutate({
                            id: goal.id,
                            data: { completed: true, progress: 100 },
                          })
                        }
                        data-testid={`button-complete-goal-${goal.id}`}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Complete
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteGoalMutation.mutate(goal.id)}
                        data-testid={`button-delete-goal-${goal.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Completed Goals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedGoals.map((goal) => (
                <Card key={goal.id} className="opacity-75" data-testid={`completed-goal-${goal.id}`}>
                  <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 shrink-0" />
                        <CardTitle className="text-lg leading-tight line-through">
                          {goal.title}
                        </CardTitle>
                      </div>
                      {goal.description && (
                        <CardDescription className="line-clamp-2">
                          {goal.description}
                        </CardDescription>
                      )}
                    </div>
                    <Badge variant="outline">{goal.category}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-mono">
                        Completed {format(new Date(goal.updatedAt), "MMM d, yyyy")}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteGoalMutation.mutate(goal.id)}
                        data-testid={`button-delete-completed-goal-${goal.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : goals?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Target className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-2xl font-bold mb-2">No goals yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Start setting your goals and track your progress towards achieving them
              </p>
              <Button onClick={() => setDialogOpen(true)} data-testid="button-create-first-goal-empty">
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
