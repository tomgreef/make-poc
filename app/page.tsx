"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get userId from cookie
    const userIdCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userId="))
      ?.split("=")[1];
    setUserId(userIdCookie || null);
  }, []);

  const handleLogout = () => {
    // Delete the userId cookie
    document.cookie = "userId=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/login");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="w-full p-4 border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">Make.com Integration</h1>
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
