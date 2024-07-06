"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

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
      <div className="space-y-3">
        <p>
          Signed in as{" "}
          <span className="font-medium">{session.user?.email}</span>
        </p>
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
      <Button onClick={() => signIn()}>Sign in</Button>
    </div>
  );
}
