"use client";
import { useSession } from "next-auth/react";

declare module "next-auth" {
  interface User {
    role?: string;
  }
}

export default function Dashboard() {
  const { data: session } = useSession();

  if (session?.user?.role === "admin") {
    return <p>You are an admin, welcome!</p>;
  }

  return <p>You are not authorized to view this page!</p>;
}
