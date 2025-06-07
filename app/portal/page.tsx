"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PortalPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const userIdCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userId="))
      ?.split("=")[1];
    setUserId(userIdCookie || null);
  }, []);

  const handleLogout = () => {
    document.cookie = "userId=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/login");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="w-full p-4 border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Portal Integration</h1>
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
          <portal-integrations
            urlOrPrefix={`${process.env.NEXT_PUBLIC_URL}/api/make`}
          />
        </div>
      </main>

      <Script
        type="module"
        src="https://eu1.make.com/portal/static/js/portal-integrations.js"
      />
    </div>
  );
}
