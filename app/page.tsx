"use client";
import Script from "next/script";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div
        style={{
          maxWidth: "1000px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "auto",
        }}
      >
        <portal-integrations urlOrPrefix="http://localhost:3000/proxy" />
      </div>
      <Script
        type="module"
        src="https://eu1.make.com/portal/static/js/portal-integrations.js"
      ></Script>
    </div>
  );
}
