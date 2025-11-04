import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Target, StickyNote, TrendingUp, Clock, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "wouter";
import type { Goal, Note, Activity } from "@shared/schema";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: goals, isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const { data: notes, isLoading: notesLoading } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const activeGoals = goals?.filter((g) => !g.completed) || [];
  const completedGoals = goals?.filter((g) => g.completed) || [];
  const recentNotes = notes?.slice(0, 3) || [];
  const recentActivities = activities?.slice(0, 5) || [];

  const stats = [
    {
      title: "Active Goals",
      value: activeGoals.length,
      icon: Target,
      color: "text-primary",
    },
    {
      title: "Completed Today",
      value: completedGoals.filter(
        (g) =>
          g.updatedAt &&
          format(new Date(g.updatedAt), "yyyy-MM-dd") ===
            format(new Date(), "yyyy-MM-dd")
      ).length,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-500",
    },
    {
      title: "Notes Saved",
      value: notes?.length || 0,
      icon: StickyNote,
      color: "text-blue-600 dark:text-blue-500",
    },
    {
      title: "Activities",
      value: activities?.length || 0,
      icon: TrendingUp,
      color: "text-purple-600 dark:text-purple-500",
    },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-7xl p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Welcome back</h1>
          <p className="text-lg text-muted-foreground">
            Here's what's happening with your personal AI today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="overflow-visible">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold" data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    {stat.title}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Goals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle className="text-2xl">Active Goals</CardTitle>
                <CardDescription>Track your progress</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild data-testid="link-view-all-goals">
                <Link href="/goals">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {goalsLoading ? (
                <>
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </>
              ) : activeGoals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Target className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No active goals yet. Start setting your targets!
                  </p>
                  <Button variant="outline" size="sm" asChild data-testid="button-create-first-goal">
                    <Link href="/goals">Create your first goal</Link>
                  </Button>
                </div>
              ) : (
                activeGoals.slice(0, 3).map((goal) => (
                  <div
                    key={goal.id}
                    className="space-y-3 p-5 rounded-lg border hover-elevate active-elevate-2"
                    data-testid={`goal-card-${goal.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg leading-tight truncate">
                          {goal.title}
                        </h3>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {goal.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {goal.category}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-mono font-medium">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                    {goal.targetDate && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className="font-mono">
                          Due {format(new Date(goal.targetDate), "MMM d, yyyy")}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Notes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle className="text-2xl">Recent Notes</CardTitle>
                <CardDescription>Your saved insights</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild data-testid="link-view-all-notes">
                <Link href="/notes">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {notesLoading ? (
                <>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </>
              ) : recentNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <StickyNote className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No notes yet. Start capturing your thoughts!
                  </p>
                  <Button variant="outline" size="sm" asChild data-testid="button-create-first-note">
                    <Link href="/notes">Create your first note</Link>
                  </Button>
                </div>
              ) : (
                recentNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-lg border hover-elevate active-elevate-2"
                    data-testid={`note-card-${note.id}`}
                  >
                    <h3 className="font-semibold leading-tight mb-1">{note.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {note.content}
                    </p>
                    <div className="flex items-center gap-2">
                      {note.tags?.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      <span className="text-xs text-muted-foreground font-mono ml-auto">
                        {format(new Date(note.createdAt), "MMM d")}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Recent Activity</CardTitle>
            <CardDescription>Your productivity timeline</CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">
                  No activity yet. Start using AstraMind to see your timeline!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity, idx) => (
                  <div key={activity.id} className="flex gap-4" data-testid={`activity-${activity.id}`}>
                    <div className="flex flex-col items-center">
                      <div className="flex h-3 w-3 items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      {idx < recentActivities.length - 1 && (
                        <div className="w-px flex-1 bg-border mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-1">
                        {format(new Date(activity.createdAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Action */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="p-8">
            <div className="flex items-center justify-between gap-6 flex-wrap">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-bold">Ready to chat?</h3>
                </div>
                <p className="text-muted-foreground">
                  Start a conversation with your AI assistant to plan your day, set goals, or learn something new
                </p>
              </div>
              <Button size="lg" asChild data-testid="button-start-chat">
                <Link href="/chat">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Start Chatting
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
