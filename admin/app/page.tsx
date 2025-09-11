// app/page.tsx 
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // only run on client
    const token = localStorage.getItem("token");
    if (!token) {
      // no token → kick back to login
      router.replace("/login");
    } else {
      // token exists → render dashboard
      setIsChecking(false);
    }
  }, [router]);

  // while we’re checking localStorage, render nothing (or a loader)
  if (isChecking) {
    return null;
  }

  return <AdminDashboard />;
}
