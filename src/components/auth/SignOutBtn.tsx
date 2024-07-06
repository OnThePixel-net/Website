"use client";

import { useRouter } from "next/navigation";

export default function SignOutBtn() {
  const router = useRouter();
  const handleSignOut = async () => {
    const response = await fetch("/api/sign-out", {
      method: "POST",
      redirect: "manual",
    });

    if (response.status === 0) {
      return router.refresh();
    }
  };
  return (
    <button onClick={handleSignOut} className="w-full text-left">
      Sign out
    </button>
  );
}
