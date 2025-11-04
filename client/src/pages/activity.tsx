import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, MessageSquare, Target, StickyNote, CheckCircle2 } from "lucide-react";
import type { Activity } from "@shared/schema";
import { format, startOfDay, endOfDay, subDays } from "date-fns";

export default function ActivityPage() {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "chat":
        return MessageSquare;
      case "goal_created":
      case "goal_updated":
      case "goal_completed":
        return Target;
      case "note_created":
      case "note_updated":
        return StickyNote;
      default:
        return TrendingUp;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "chat":
        return "text-primary";
      case "goal_created":
      case "goal_updated":
        return "text-blue-600 dark:text-blue-500";
      case "goal_completed":
        return "text-green-600 dark:text-green-500";
      case "note_created":
      case "note_updated":
        return "text-purple-600 dark:text-purple-500";
      default:
        return "text-muted-foreground";
    }
  };

  const today = new Date();
  const todayActivities =
    activities?.filter(
      (a) =>
        new Date(a.createdAt) >= startOfDay(today) &&
        new Date(a.createdAt) <= endOfDay(today)
    ) || [];
  const yesterdayActivities =
    activities?.filter(
      (a) =>
        new Date(a.createdAt) >= startOfDay(subDays(today, 1)) &&
        new Date(a.createdAt) < startOfDay(today)
    ) || [];
  const olderActivities =
    activities?.filter((a) => new Date(a.createdAt) < startOfDay(subDays(today, 1))) || [];

  const activityStats = {
    total: activities?.length || 0,
    today: todayActivities.length,
    chats: activities?.filter((a) => a.type === "chat").length || 0,
    goals: activities?.filter((a) => a.type.includes("goal")).length || 0,
    notes: activities?.filter((a) => a.type.includes("note")).length || 0,
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-7xl p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Activity</h1>
          <p className="text-lg text-muted-foreground">
            Your productivity timeline and insights
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div className="text-3xl font-bold" data-testid="stat-total-activities">
                  {activityStats.total}
                </div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Total Activities
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
                <div className="text-3xl font-bold" data-testid="stat-today-activities">
                  {activityStats.today}
                </div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Today
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <div className="text-3xl font-bold">{activityStats.chats}</div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Chats
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                <div className="text-3xl font-bold">{activityStats.goals}</div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Goals
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <StickyNote className="h-5 w-5 text-purple-600 dark:text-purple-500" />
                <div className="text-3xl font-bold">{activityStats.notes}</div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Notes
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Timeline</CardTitle>
            <CardDescription>Your complete activity history</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : activities?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <TrendingUp className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-2xl font-bold mb-2">No activity yet</h3>
                <p className="text-muted-foreground">
                  Start using AstraMind to see your activity timeline
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Today */}
                {todayActivities.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Today
                    </h3>
                    <div className="space-y-4">
                      {todayActivities.map((activity, idx) => {
                        const Icon = getActivityIcon(activity.type);
                        return (
                          <div key={activity.id} className="flex gap-4" data-testid={`activity-${activity.id}`}>
                            <div className="flex flex-col items-center">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                <Icon className={`h-4 w-4 ${getActivityColor(activity.type)}`} />
                              </div>
                              {idx < todayActivities.length - 1 && (
                                <div className="w-px flex-1 bg-border mt-2" />
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <p className="text-sm leading-relaxed">{activity.description}</p>
                              <p className="text-xs text-muted-foreground font-mono mt-1">
                                {format(new Date(activity.createdAt), "h:mm a")}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Yesterday */}
                {yesterdayActivities.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Yesterday
                    </h3>
                    <div className="space-y-4">
                      {yesterdayActivities.map((activity, idx) => {
                        const Icon = getActivityIcon(activity.type);
                        return (
                          <div key={activity.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                <Icon className={`h-4 w-4 ${getActivityColor(activity.type)}`} />
                              </div>
                              {idx < yesterdayActivities.length - 1 && (
                                <div className="w-px flex-1 bg-border mt-2" />
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <p className="text-sm leading-relaxed">{activity.description}</p>
                              <p className="text-xs text-muted-foreground font-mono mt-1">
                                {format(new Date(activity.createdAt), "h:mm a")}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Older */}
                {olderActivities.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Earlier
                    </h3>
                    <div className="space-y-4">
                      {olderActivities.map((activity, idx) => {
                        const Icon = getActivityIcon(activity.type);
                        return (
                          <div key={activity.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                <Icon className={`h-4 w-4 ${getActivityColor(activity.type)}`} />
                              </div>
                              {idx < olderActivities.length - 1 && (
                                <div className="w-px flex-1 bg-border mt-2" />
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <p className="text-sm leading-relaxed">{activity.description}</p>
                              <p className="text-xs text-muted-foreground font-mono mt-1">
                                {format(new Date(activity.createdAt), "MMM d, h:mm a")}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
