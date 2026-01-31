import { createClient } from '@/lib/supabase/server';
import { BenchmarkGrid } from '@/components/functional/benchmark-grid';
import { redirect } from 'next/navigation';

interface FunctionalTest {
  id: string;
  user_id: string;
  date: string;
  test_type: string;
  value: number;
  unit: string;
  load_kg: number | null;
  notes: string | null;
  is_pr: boolean;
  created_at: string;
}

interface BenchmarkGroup {
  latest: FunctionalTest | null;
  best: FunctionalTest | null;
  all: FunctionalTest[];
}

const VALID_TEST_TYPES = [
  'dead_hang',
  'farmer_walk',
  'plank',
  'wall_sit',
  'pull_ups',
  'balance_open_l',
  'balance_open_r',
  'balance_closed_l',
  'balance_closed_r',
  'floor_getup',
  'deadlift_reps',
  'grip_l',
  'grip_r',
  'mile_run',
] as const;

async function getFunctionalData(userId: string): Promise<Record<string, BenchmarkGroup>> {
  const supabase = await createClient();

  // Fetch all functional tests for the user
  const { data: tests, error } = await supabase
    .from('functional_tests')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching functional tests:', error);
    return initializeEmptyGroups();
  }

  // Group by test type and calculate latest + best for each
  const groupedByType: Record<string, BenchmarkGroup> = initializeEmptyGroups();

  tests?.forEach((test: FunctionalTest) => {
    const group = groupedByType[test.test_type];
    if (!group) return;

    group.all.push(test);

    // Update latest (already sorted by date descending)
    if (!group.latest) {
      group.latest = test;
    }

    // Update best (depends on test type)
    if (!group.best) {
      group.best = test;
    } else {
      // For mile_run and floor_getup, LOWER is better
      if (test.test_type === 'mile_run' || test.test_type === 'floor_getup') {
        if (test.value < group.best.value) {
          group.best = test;
        }
      } else {
        // For all other tests, HIGHER is better
        if (test.value > group.best.value) {
          group.best = test;
        }
      }
    }
  });

  return groupedByType;
}

function initializeEmptyGroups(): Record<string, BenchmarkGroup> {
  const groups: Record<string, BenchmarkGroup> = {};
  VALID_TEST_TYPES.forEach(type => {
    groups[type] = {
      latest: null,
      best: null,
      all: []
    };
  });
  return groups;
}

export default async function FunctionalFitnessPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const groupedData = await getFunctionalData(session.user.id);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Functional Fitness</h1>
        <p className="text-muted-foreground mt-2">
          Track your performance on the Centenarian Decathlon benchmarks. These tests measure the functional
          strength, mobility, and endurance you'll need to live a long, active life.
        </p>
      </div>

      {/* Benchmark Grid */}
      <BenchmarkGrid groupedData={groupedData} />

      {/* Information Section */}
      <div className="bg-muted/50 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold">About the Centenarian Decathlon</h3>
        <div className="prose prose-sm max-w-none">
          <p className="text-sm text-muted-foreground">
            The Centenarian Decathlon is Dr. Peter Attia's framework for maintaining functional fitness
            throughout life. These benchmarks represent the physical capabilities you'll want to preserve
            to maintain independence and quality of life as you age.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Each test targets a different aspect of functional fitness: strength, endurance, balance,
            and mobility. The targets shown are appropriate for a 42-year-old male and represent the
            level of fitness needed to perform daily activities with ease in your later years.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-background rounded-md p-4">
            <div className="text-2xl font-bold text-green-600">≥100%</div>
            <div className="text-xs text-muted-foreground mt-1">Target achieved</div>
          </div>
          <div className="bg-background rounded-md p-4">
            <div className="text-2xl font-bold text-yellow-600">70-99%</div>
            <div className="text-xs text-muted-foreground mt-1">Approaching target</div>
          </div>
          <div className="bg-background rounded-md p-4">
            <div className="text-2xl font-bold text-red-600">&lt;70%</div>
            <div className="text-xs text-muted-foreground mt-1">Needs work</div>
          </div>
        </div>
      </div>
    </div>
  );
}
