"use client";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FaDiscord } from "react-icons/fa";

const Page = () => {
  return (
    <main className="bg-popover max-w-lg mx-auto my-4 rounded-lg p-10">
      <h1 className="text-2xl font-bold text-center">
        Sign in to your account
      </h1>
      <div className="mt-4">
        <Button
          type="submit"
          onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}
          className="flex w-full justify-center items-center relative"
        >
          <FaDiscord className="size-5 absolute left-0 ml-[11px]" />
          <span className="absolute left-[150px]">Sign in with Discord</span>
        </Button>
      </div>
    </main>
  );
};

export default Page;
