"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toInitials } from "@/lib/utils";

export default function SignIn() {
  const { data: session, status } = useSession();

  if (status === "loading")
    return (
      <div className="my-[10px]">
        <Button>Sign in</Button>
      </div>
    );

  if (session) {
    return (
      <div className="my-[10px]">
        <Button
          variant={"destructive"}
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Sign out
        </Button>
      </div>
    );
  }
  return (
    <div className="my-[10px]">
      <Button onClick={() => (window.location.href = "/sign-in")}>
        Sign in
      </Button>
    </div>
  );
}
