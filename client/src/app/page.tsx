"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSkeleton from "@/components/loading-skeleton";
import { useAuth } from "@/providers/auth";

const Home = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isRedirecting && !loading) {
      if (isAuthenticated && user?.role) {
        setIsRedirecting(true);
        router.push(`/${user.role.toLowerCase()}`);
      } else {
        const savedRole = localStorage.getItem('role');
        if (savedRole) {
          try {
            const role = JSON.parse(savedRole);
            setIsRedirecting(true);
            router.push(`/${role.toLowerCase()}`);
          } catch (e) {
            console.error("Error parsing saved role:", e);
          }
        }
      }
    }
  }, [user, router, loading, isAuthenticated, isRedirecting]);

  return (
    <div className="h-screen">
      <LoadingSkeleton />
    </div>
  );
};

export default Home;