"use client";

import { AppLayout } from "@/components/layout";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Select, Tabs, TabContent, TabList, TabTrigger } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { Check, ExternalLink, Key, Link2, RefreshCw, Settings, User, X, Zap } from "lucide-react";
import { useState } from "react";

interface IntegrationStatus {
  connected: boolean;
  lastSync: string | null;
  lastSyncStatus: "success" | "error" | null;
  webhookEnabled: boolean;
}

const demoHevy: IntegrationStatus = {
  connected: true,
  lastSync: "2026-01-31T10:30:00Z",
  lastSyncStatus: "success",
  webhookEnabled: true,
};

const demoWhoop: IntegrationStatus = {
  connected: true,
  lastSync: "2026-01-31T09:15:00Z",
  lastSyncStatus: "success",
  webhookEnabled: true,
};

export default function SettingsPage() {
  const [hevyApiKey, setHevyApiKey] = useState("••••••••••••••••");
  const [isTestingHevy, setIsTestingHevy] = useState(false);
  const [isSyncingHevy, setIsSyncingHevy] = useState(false);
  const [isSyncingWhoop, setIsSyncingWhoop] = useState(false);

  const [profile, setProfile] = useState({
    displayName: "AK",
    heightCm: 175,
    weightUnit: "kg",
    distanceUnit: "km",
    restingHr: 56,
    maxHr: 178,
    hrvBaseline: 65,
  });

  const handleTestHevyConnection = async () => {
    setIsTestingHevy(true);
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsTestingHevy(false);
  };

  const handleSyncHevy = async () => {
    setIsSyncingHevy(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSyncingHevy(false);
  };

  const handleSyncWhoop = async () => {
    setIsSyncingWhoop(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSyncingWhoop(false);
  };

  return (
    <AppLayout title="Settings" subtitle="Integrations and preferences">
      <div className="space-y-6">
        <Tabs defaultValue="integrations">
          <TabList>
            <TabTrigger value="integrations">Integrations</TabTrigger>
            <TabTrigger value="profile">Profile</TabTrigger>
          </TabList>

          <TabContent value="integrations">
            <div className="space-y-6">
              {/* Hevy Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                        <Zap className="h-5 w-5 text-blue-500" />
                      </div>
                      Hevy
                    </span>
                    <Badge variant={demoHevy.connected ? "success" : "error"}>
                      {demoHevy.connected ? "Connected" : "Not Connected"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Sync your strength training workouts automatically from Hevy.
                  </p>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        label="API Key"
                        type="password"
                        value={hevyApiKey}
                        onChange={(e) => setHevyApiKey(e.target.value)}
                        className="flex-1"
                      />
                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          onClick={handleTestHevyConnection}
                          disabled={isTestingHevy}
                        >
                          {isTestingHevy ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            "Test"
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
                      <div className="flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-zinc-500" />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">Webhook</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {demoHevy.webhookEnabled ? (
                          <Badge variant="success" size="sm">
                            <Check className="mr-1 h-3 w-3" />
                            Enabled
                          </Badge>
                        ) : (
                          <Badge variant="error" size="sm">
                            <X className="mr-1 h-3 w-3" />
                            Disabled
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          Configure
                        </Button>
                      </div>
                    </div>

                    {demoHevy.lastSync && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Last sync: {formatDate(demoHevy.lastSync)}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSyncHevy}
                          disabled={isSyncingHevy}
                        >
                          {isSyncingHevy ? (
                            <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-1 h-4 w-4" />
                          )}
                          Sync Now
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Whoop Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                        <Zap className="h-5 w-5 text-green-500" />
                      </div>
                      Whoop
                    </span>
                    <Badge variant={demoWhoop.connected ? "success" : "error"}>
                      {demoWhoop.connected ? "Connected" : "Not Connected"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Sync recovery, sleep, and strain data from your Whoop band.
                  </p>

                  {demoWhoop.connected ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-500" />
                          <span className="text-sm font-medium text-green-700 dark:text-green-400">
                            Connected to Whoop
                          </span>
                        </div>
                        <Button variant="outline" size="sm" className="text-red-600">
                          Disconnect
                        </Button>
                      </div>

                      <div className="flex items-center justify-between rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
                        <div className="flex items-center gap-2">
                          <Link2 className="h-4 w-4 text-zinc-500" />
                          <span className="text-sm text-zinc-700 dark:text-zinc-300">Webhook</span>
                        </div>
                        <Badge variant="success" size="sm">
                          <Check className="mr-1 h-3 w-3" />
                          Enabled
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Last sync: {formatDate(demoWhoop.lastSync!)}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSyncWhoop}
                          disabled={isSyncingWhoop}
                        >
                          {isSyncingWhoop ? (
                            <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-1 h-4 w-4" />
                          )}
                          Sync Now
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button className="w-full">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Connect with Whoop
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Sync Logs */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sync Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { source: "Whoop", type: "cron", status: "success", records: 24, time: "2 hours ago" },
                      { source: "Hevy", type: "webhook", status: "success", records: 1, time: "3 hours ago" },
                      { source: "Whoop", type: "cron", status: "success", records: 24, time: "4 hours ago" },
                      { source: "Hevy", type: "cron", status: "success", records: 3, time: "8 hours ago" },
                      { source: "Whoop", type: "cron", status: "error", records: 0, time: "1 day ago" },
                    ].map((log, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant={log.status === "success" ? "success" : "error"} size="sm">
                            {log.status === "success" ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          </Badge>
                          <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                              {log.source} - {log.type}
                            </p>
                            <p className="text-xs text-zinc-500">{log.time}</p>
                          </div>
                        </div>
                        <span className="text-sm text-zinc-500">
                          {log.records} records
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabContent>

          <TabContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  User Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Display Name"
                    value={profile.displayName}
                    onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  />
                  <Input
                    label="Height (cm)"
                    type="number"
                    value={profile.heightCm}
                    onChange={(e) => setProfile({ ...profile, heightCm: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    label="Weight Unit"
                    value={profile.weightUnit}
                    onChange={(e) => setProfile({ ...profile, weightUnit: e.target.value })}
                    options={[
                      { value: "kg", label: "Kilograms (kg)" },
                      { value: "lbs", label: "Pounds (lbs)" },
                    ]}
                  />
                  <Select
                    label="Distance Unit"
                    value={profile.distanceUnit}
                    onChange={(e) => setProfile({ ...profile, distanceUnit: e.target.value })}
                    options={[
                      { value: "km", label: "Kilometers (km)" },
                      { value: "miles", label: "Miles" },
                    ]}
                  />
                </div>

                <div className="border-t border-zinc-200 pt-4 dark:border-zinc-700">
                  <h3 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
                    Physiological Baselines
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Input
                      label="Resting HR (bpm)"
                      type="number"
                      value={profile.restingHr}
                      onChange={(e) => setProfile({ ...profile, restingHr: parseInt(e.target.value) || 0 })}
                    />
                    <Input
                      label="Max HR (bpm)"
                      type="number"
                      value={profile.maxHr}
                      onChange={(e) => setProfile({ ...profile, maxHr: parseInt(e.target.value) || 0 })}
                    />
                    <Input
                      label="HRV Baseline (ms)"
                      type="number"
                      value={profile.hrvBaseline}
                      onChange={(e) => setProfile({ ...profile, hrvBaseline: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <Button className="w-full">Save Profile</Button>
              </CardContent>
            </Card>
          </TabContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
