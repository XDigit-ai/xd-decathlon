"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, AlertCircle, Link } from "lucide-react";

interface SyncControlsProps {
  hasHevyKey?: boolean;
  hasWhoopConnection?: boolean;
}

export function SyncControls({ hasHevyKey = false, hasWhoopConnection = false }: SyncControlsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSync = async (service: "hevy" | "whoop") => {
    setLoading(service);
    try {
      const response = await fetch(`/api/sync/${service}`);
      const data = await response.json();

      if (response.ok) {
        showMessage("success", `${service === "hevy" ? "Hevy" : "Whoop"} sync completed successfully`);
        router.refresh();
      } else {
        showMessage("error", data.error || `Failed to sync ${service}`);
      }
    } catch (error) {
      showMessage("error", `Failed to sync ${service}`);
    } finally {
      setLoading(null);
    }
  };

  const handleWhoopConnect = () => {
    window.location.href = "/api/auth/whoop";
  };

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Hevy Sync */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Hevy Integration</CardTitle>
            <Badge variant={hasHevyKey ? "default" : "secondary"}>
              {hasHevyKey ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Not Connected
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Sync your workout data from Hevy. Make sure you have added your API key in the API Keys section below.
          </p>
          <Button
            onClick={() => handleSync("hevy")}
            disabled={!hasHevyKey || loading === "hevy"}
            className="w-full"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading === "hevy" ? "animate-spin" : ""}`} />
            {loading === "hevy" ? "Syncing..." : "Sync Hevy Workouts"}
          </Button>
        </CardContent>
      </Card>

      {/* Whoop Sync */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Whoop Integration</CardTitle>
            <Badge variant={hasWhoopConnection ? "default" : "secondary"}>
              {hasWhoopConnection ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Not Connected
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Connect your Whoop account to sync recovery, sleep, and strain data automatically.
          </p>
          {hasWhoopConnection ? (
            <Button
              onClick={() => handleSync("whoop")}
              disabled={loading === "whoop"}
              className="w-full"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading === "whoop" ? "animate-spin" : ""}`} />
              {loading === "whoop" ? "Syncing..." : "Sync Whoop Data"}
            </Button>
          ) : (
            <Button
              onClick={handleWhoopConnect}
              className="w-full"
            >
              <Link className="h-4 w-4 mr-2" />
              Connect Whoop Account
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
