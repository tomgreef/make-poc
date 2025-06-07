"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  IntegrationListItem,
  ListIntegrationsResponse,
} from "./[...make]/types";

export default function ApiPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userIdCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userId="))
      ?.split("=")[1];
    setUserId(userIdCookie || null);
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch(`/api/make/api/bridge/integrations`);
      const data = (await response.json()) as ListIntegrationsResponse;
      setIntegrations(data.integrations);
    } catch (error) {
      console.error("Error fetching integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleIntegration = async (id: number, currentStatus: boolean) => {
    try {
      const action = currentStatus ? "deactivate" : "activate";
      await fetch(`/api/make/api/bridge/integrations/${id}/${action}`, {
        method: "POST",
      });
      await fetchIntegrations(); // Refresh the list
    } catch (error) {
      console.error("Error toggling integration:", error);
    }
  };

  const handleLogout = () => {
    document.cookie = "userId=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/login");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="w-full p-4 border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">API Integration</h1>
            <nav className="ml-8">
              <ul className="flex gap-4">
                <li>
                  <Link
                    href="/portal"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Portal Method
                  </Link>
                </li>
                <li>
                  <Link
                    href="/api"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    API Method
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {userId && (
              <>
                <span className="text-sm text-gray-600">User ID: {userId}</span>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-[1000px] mx-auto">
          <div className="grid gap-4">
            {loading ? (
              <div className="text-center py-8">Loading integrations...</div>
            ) : integrations.length === 0 ? (
              <div className="text-center py-8">No integrations found</div>
            ) : (
              integrations.map(({ template, scenario }) => (
                <Card key={template.publicVersionId} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">{scenario.name}</h3>
                      <p className="text-sm text-gray-500">
                        Status: {scenario.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                    <Button
                      onClick={() =>
                        toggleIntegration(scenario.id, scenario.isActive)
                      }
                      variant={scenario.isActive ? "destructive" : "default"}
                    >
                      {scenario.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
