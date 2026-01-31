import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/settings/profile-form";
import { SyncControls } from "@/components/settings/sync-controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

async function getSettingsData(userId: string) {
  const supabase = await createClient();

  const [profileData, apiKeysData] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle(),

    supabase
      .from("api_keys")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  return {
    profile: profileData.data,
    apiKeys: apiKeysData.data,
  };
}

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { profile, apiKeys } = await getSettingsData(user.id);

  const hasHevyKey = !!(apiKeys?.hevy_api_key);
  const hasWhoopConnection = !!(apiKeys?.whoop_access_token);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your profile, integrations, and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <ProfileForm profile={profile} />

      {/* Sync Controls */}
      <SyncControls
        hasHevyKey={hasHevyKey}
        hasWhoopConnection={hasWhoopConnection}
      />

      {/* API Keys Section */}
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hevy-api-key">Hevy API Key</Label>
            <div className="flex gap-2">
              <Input
                id="hevy-api-key"
                type="password"
                value={hasHevyKey ? "••••••••••••••••" : ""}
                placeholder="Not configured"
                disabled
                className="flex-1"
              />
              <Badge variant={hasHevyKey ? "default" : "secondary"}>
                {hasHevyKey ? "Set" : "Not Set"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              To update your Hevy API key, please contact support or use the Hevy settings in your app.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whoop-status">Whoop Connection</Label>
            <div className="flex gap-2">
              <Input
                id="whoop-status"
                type="text"
                value={hasWhoopConnection ? "Connected" : "Not connected"}
                disabled
                className="flex-1"
              />
              <Badge variant={hasWhoopConnection ? "default" : "secondary"}>
                {hasWhoopConnection ? "Connected" : "Not Connected"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Use the Whoop Integration section above to connect or reconnect your account.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={user.email || ""}
              disabled
              className="bg-gray-50"
            />
            <p className="text-sm text-muted-foreground">
              Your account email cannot be changed here.
            </p>
          </div>

          <div className="space-y-2">
            <Label>User ID</Label>
            <Input
              type="text"
              value={user.id}
              disabled
              className="bg-gray-50 font-mono text-xs"
            />
            <p className="text-sm text-muted-foreground">
              Your unique user identifier for technical support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
