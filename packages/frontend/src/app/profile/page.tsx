"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";

export default function ProfileRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace(`/profile/${user.nullifier}`);
      } else {
        router.replace("/setup");
      }
    }
  }, [user, isLoading, router]);

  return (
    <AppLayout>
      <PageHeader title="Profile" subtitle="Loading..." showBack onBack={() => router.back()} />
      <div className="p-12 flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono uppercase tracking-widest text-primary/60">
          Restoring session...
        </p>
      </div>
    </AppLayout>
  );
}
