import { createClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/supabase/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarCheck, Dumbbell, Moon, CheckSquare, ClipboardList, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';
import { TodaysPlan } from '@/components/routines/todays-plan';

interface DayInfo {
  label: string;
  date: string;
  isToday: boolean;
  hasWorkout: boolean;
}

async function getThisWeekData(userId: string) {
  const supabase = await createClient();

  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const todayStr = now.toISOString().split('T')[0];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const [workoutsResult, wellnessResult, recoveryResult, weightResult, profileResult] = await Promise.all([
    // This week's workouts
    supabase
      .from('hevy_workouts')
      .select('id, title, start_time, total_volume_kg, total_sets')
      .eq('user_id', userId)
      .gte('start_time', monday.toISOString())
      .lte('start_time', sunday.toISOString())
      .order('start_time', { ascending: true }),
    // Today's wellness
    supabase
      .from('daily_wellness')
      .select('*')
      .eq('user_id', userId)
      .eq('date', todayStr)
      .maybeSingle(),
    // Latest recovery
    supabase
      .from('whoop_recovery')
      .select('recovery_score, traffic_light')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle(),
    // Latest weight
    supabase
      .from('daily_weight')
      .select('weight_kg, date')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle(),
    // Profile for program start date
    supabase
      .from('profiles')
      .select('program_start_date')
      .eq('id', userId)
      .maybeSingle(),
  ]);

  const workouts = workoutsResult.data || [];
  const workoutDates = new Set(
    workouts.map(w => new Date(w.start_time).toISOString().split('T')[0])
  );

  // Build 7-day calendar
  const days: DayInfo[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({
      label: dayLabels[i],
      date: dateStr,
      isToday: dateStr === todayStr,
      hasWorkout: workoutDates.has(dateStr),
    });
  }

  // Weekly stats
  const totalVolume = workouts.reduce((sum, w) => sum + (w.total_volume_kg || 0), 0);
  const totalSets = workouts.reduce((sum, w) => sum + (w.total_sets || 0), 0);

  return {
    days,
    workoutsCount: workouts.length,
    totalVolume: Math.round(totalVolume),
    totalSets,
    hasCheckedIn: !!wellnessResult.data,
    recoveryScore: recoveryResult.data?.recovery_score ?? null,
    trafficLight: (recoveryResult.data?.traffic_light ?? 'green') as 'green' | 'yellow' | 'red',
    latestWeight: weightResult.data?.weight_kg ?? null,
    programStartDate: profileResult.data?.program_start_date ?? null,
  };
}

export default async function ThisWeekPage() {
  const user = await getAuthUser();
  const data = await getThisWeekData(user.id);

  const trafficColors = {
    green: 'bg-emerald-500',
    yellow: 'bg-amber-500',
    red: 'bg-rose-500',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">This Week</h1>
        <p className="mt-2 text-muted-foreground">
          Your weekly training overview and daily readiness
        </p>
      </div>

      {/* Week Calendar Strip */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between gap-2">
            {data.days.map((day) => (
              <div
                key={day.date}
                className={cn(
                  "flex flex-1 flex-col items-center gap-2 rounded-xl py-3 transition-colors",
                  day.isToday ? "bg-primary/10 ring-2 ring-primary/20" : "",
                )}
              >
                <span className={cn(
                  "text-xs font-medium",
                  day.isToday ? "text-primary" : "text-muted-foreground"
                )}>
                  {day.label}
                </span>
                <span className={cn(
                  "text-sm font-bold",
                  day.isToday ? "text-primary" : "text-foreground"
                )}>
                  {new Date(day.date + 'T12:00:00').getDate()}
                </span>
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  day.hasWorkout ? "bg-primary" : "bg-muted"
                )} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Plan */}
      <TodaysPlan programStartDate={data.programStartDate ? new Date(data.programStartDate) : undefined} />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Dumbbell className="h-4 w-4" />
              <span>Workouts</span>
            </div>
            <div className="text-2xl font-bold">{data.workoutsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Dumbbell className="h-4 w-4" />
              <span>Volume</span>
            </div>
            <div className="text-2xl font-bold">
              {data.totalVolume > 0 ? `${data.totalVolume.toLocaleString()} kg` : '--'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{data.totalSets} sets</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <CheckSquare className="h-4 w-4" />
              <span>Check-In</span>
            </div>
            <Badge variant={data.hasCheckedIn ? "default" : "secondary"}>
              {data.hasCheckedIn ? "Done" : "Pending"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Moon className="h-4 w-4" />
              <span>Recovery</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn("h-3 w-3 rounded-full", trafficColors[data.trafficLight])} />
              <span className="text-2xl font-bold">
                {data.recoveryScore !== null ? `${data.recoveryScore}%` : '--'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link href="/routines/workouts">
          <Card className="group cursor-pointer transition-all hover:shadow-md">
            <CardContent className="flex items-center justify-between pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Workouts</p>
                  <p className="text-xs text-muted-foreground">View workout history</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/routines/check-in">
          <Card className="group cursor-pointer transition-all hover:shadow-md">
            <CardContent className="flex items-center justify-between pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <CheckSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Daily Check-In</p>
                  <p className="text-xs text-muted-foreground">Log wellness & weight</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/routines/reviews">
          <Card className="group cursor-pointer transition-all hover:shadow-md">
            <CardContent className="flex items-center justify-between pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Reviews</p>
                  <p className="text-xs text-muted-foreground">Weekly, monthly, quarterly</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
