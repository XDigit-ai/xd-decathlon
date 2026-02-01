import { createClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/supabase/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WeightForm } from '@/components/body/weight-form';
import { WeightHistory } from '@/components/body/weight-history';
import { MeasurementsForm } from '@/components/body/measurements-form';
import { DexaForm } from '@/components/body/dexa-form';
import { formatDate } from '@/lib/utils/date';
import { formatWeight, formatPercentage } from '@/lib/utils/format';

interface WeightEntry {
  id: string;
  date: string;
  weight_kg: number;
  body_fat_pct: number | null;
  notes: string | null;
  source: string;
}

interface MeasurementEntry {
  id: string;
  date: string;
  chest_cm: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  left_arm_cm: number | null;
  right_arm_cm: number | null;
  left_thigh_cm: number | null;
  right_thigh_cm: number | null;
  left_calf_cm: number | null;
  right_calf_cm: number | null;
  neck_cm: number | null;
  shoulders_cm: number | null;
  notes: string | null;
}

interface DexaScanEntry {
  id: string;
  date: string;
  total_body_fat_pct: number;
  lean_mass_kg: number | null;
  fat_mass_kg: number | null;
  bone_mineral_density: number | null;
  visceral_fat_area_cm2: number | null;
  android_fat_pct: number | null;
  gynoid_fat_pct: number | null;
  appendicular_lean_mass_kg: number | null;
  notes: string | null;
  scan_provider: string | null;
}

async function getBodyData(userId: string) {
  const supabase = await createClient();

  const [weightResult, measurementsResult, dexaResult] = await Promise.all([
    supabase
      .from('daily_weight')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30),
    supabase
      .from('body_measurements')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(3),
    supabase
      .from('dexa_scans')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false }),
  ]);

  return {
    weight: weightResult.data as WeightEntry[] || [],
    measurements: measurementsResult.data as MeasurementEntry[] || [],
    dexaScans: dexaResult.data as DexaScanEntry[] || [],
  };
}

export default async function BodyCompositionPage() {
  const user = await getAuthUser();

  const { weight, measurements, dexaScans } = await getBodyData(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Body Composition</h1>
        <p className="mt-2 text-muted-foreground">
          Track your weight, body fat, measurements, and DEXA scans
        </p>
      </div>

      <Tabs defaultValue="weight" className="space-y-6">
        <TabsList>
          <TabsTrigger value="weight">Weight</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="dexa">DEXA Scans</TabsTrigger>
        </TabsList>

        <TabsContent value="weight" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeightForm />

            {weight.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Stats</CardTitle>
                  <CardDescription>Your most recent measurements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Latest Weight</p>
                    <p className="text-2xl font-bold">{formatWeight(weight[0].weight_kg, 'kg')}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(weight[0].date, 'MMM d, yyyy')}
                    </p>
                  </div>

                  {weight[0].body_fat_pct && (
                    <div>
                      <p className="text-sm text-muted-foreground">Body Fat</p>
                      <p className="text-2xl font-bold">{formatPercentage(weight[0].body_fat_pct)}</p>
                    </div>
                  )}

                  {weight.length > 1 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Change from Previous</p>
                      <p className={`text-lg font-semibold ${
                        weight[0].weight_kg < weight[1].weight_kg
                          ? 'text-green-600'
                          : weight[0].weight_kg > weight[1].weight_kg
                          ? 'text-red-600'
                          : 'text-muted-foreground'
                      }`}>
                        {weight[0].weight_kg < weight[1].weight_kg && '-'}
                        {weight[0].weight_kg > weight[1].weight_kg && '+'}
                        {Math.abs(weight[0].weight_kg - weight[1].weight_kg).toFixed(1)} kg
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <WeightHistory entries={weight} />
        </TabsContent>

        <TabsContent value="measurements" className="space-y-6">
          <MeasurementsForm />

          {measurements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Measurement History</CardTitle>
                <CardDescription>Recent body measurements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 font-medium">Date</th>
                        <th className="text-left py-2 px-2 font-medium">Chest</th>
                        <th className="text-left py-2 px-2 font-medium">Waist</th>
                        <th className="text-left py-2 px-2 font-medium">Hips</th>
                        <th className="text-left py-2 px-2 font-medium">Arms</th>
                        <th className="text-left py-2 px-2 font-medium">Thighs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {measurements.map((m) => (
                        <tr key={m.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2">{formatDate(m.date, 'MMM d')}</td>
                          <td className="py-3 px-2">{m.chest_cm ? `${m.chest_cm} cm` : '-'}</td>
                          <td className="py-3 px-2">{m.waist_cm ? `${m.waist_cm} cm` : '-'}</td>
                          <td className="py-3 px-2">{m.hips_cm ? `${m.hips_cm} cm` : '-'}</td>
                          <td className="py-3 px-2">
                            {m.left_arm_cm || m.right_arm_cm
                              ? `${m.left_arm_cm || '-'} / ${m.right_arm_cm || '-'}`
                              : '-'}
                          </td>
                          <td className="py-3 px-2">
                            {m.left_thigh_cm || m.right_thigh_cm
                              ? `${m.left_thigh_cm || '-'} / ${m.right_thigh_cm || '-'}`
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {measurements.length === 0 && (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">
                  No measurements recorded yet. Log your first measurements above!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="dexa" className="space-y-6">
          <DexaForm />

          {dexaScans.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>DEXA Scan History</CardTitle>
                <CardDescription>Your detailed body composition scans</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dexaScans.map((scan) => (
                  <div key={scan.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{formatDate(scan.date, 'MMMM d, yyyy')}</p>
                        {scan.scan_provider && (
                          <p className="text-sm text-muted-foreground">{scan.scan_provider}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{formatPercentage(scan.total_body_fat_pct)}</p>
                        <p className="text-xs text-muted-foreground">Body Fat</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                      {scan.lean_mass_kg && (
                        <div>
                          <p className="text-xs text-muted-foreground">Lean Mass</p>
                          <p className="font-medium">{scan.lean_mass_kg} kg</p>
                        </div>
                      )}
                      {scan.fat_mass_kg && (
                        <div>
                          <p className="text-xs text-muted-foreground">Fat Mass</p>
                          <p className="font-medium">{scan.fat_mass_kg} kg</p>
                        </div>
                      )}
                      {scan.bone_mineral_density && (
                        <div>
                          <p className="text-xs text-muted-foreground">BMD</p>
                          <p className="font-medium">{scan.bone_mineral_density}</p>
                        </div>
                      )}
                      {scan.visceral_fat_area_cm2 && (
                        <div>
                          <p className="text-xs text-muted-foreground">Visceral Fat</p>
                          <p className="font-medium">{scan.visceral_fat_area_cm2} cm²</p>
                        </div>
                      )}
                    </div>

                    {scan.notes && (
                      <p className="text-sm text-muted-foreground pt-2 border-t">{scan.notes}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {dexaScans.length === 0 && (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">
                  No DEXA scans recorded yet. Log your first scan above!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
