import { createClient, DEV_USER_ID } from '@/lib/supabase/server';
import { QuickAdd } from '@/components/dashboard/quick-add';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils/date';

async function getRecentWellness(userId: string) {
  const supabase = await createClient();

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const { data } = await supabase
    .from('daily_wellness')
    .select('*')
    .eq('user_id', userId)
    .gte('date', sevenDaysAgo)
    .order('date', { ascending: false });

  return data || [];
}

async function getRecentWeights(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('daily_weight')
    .select('weight_kg, body_fat_pct, date')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(7);

  return data || [];
}

export default async function CheckInPage() {
  const userId = DEV_USER_ID;

  const [wellness, weights] = await Promise.all([
    getRecentWellness(userId),
    getRecentWeights(userId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Daily Check-In</h1>
        <p className="mt-2 text-muted-foreground">
          Log your wellness, weight, and VO2 max data
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Check-in form */}
        <QuickAdd />

        {/* Recent history */}
        <div className="space-y-6">
          {/* Recent Wellness */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Wellness</CardTitle>
            </CardHeader>
            <CardContent>
              {wellness.length === 0 ? (
                <p className="text-sm text-muted-foreground">No wellness data in the last 7 days</p>
              ) : (
                <div className="space-y-3">
                  {wellness.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(entry.date)}
                      </span>
                      <div className="flex gap-3 text-xs">
                        {entry.energy > 0 && (
                          <span>Energy: <strong>{entry.energy}/5</strong></span>
                        )}
                        {entry.mood > 0 && (
                          <span>Mood: <strong>{entry.mood}/5</strong></span>
                        )}
                        {entry.stress > 0 && (
                          <span>Stress: <strong>{entry.stress}/5</strong></span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Weights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Weights</CardTitle>
            </CardHeader>
            <CardContent>
              {weights.length === 0 ? (
                <p className="text-sm text-muted-foreground">No weight data recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {weights.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(entry.date)}
                      </span>
                      <div className="flex gap-3 text-sm">
                        <span className="font-medium">{entry.weight_kg} kg</span>
                        {entry.body_fat_pct && (
                          <span className="text-muted-foreground">{entry.body_fat_pct}% BF</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
