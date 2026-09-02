"use client";
import { Button } from "@/components/ui/button";

/**
 * Client island of the (otherwise static, server-rendered) footer. The label
 * is passed in so this component does not have to subscribe to the language
 * context just to render one word.
 */
export default function BackToTopButton({ label }: { label: string }) {
  return (
    <Button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="rounded-full bg-white px-6 py-2 font-semibold text-black transition-colors hover:bg-gray-200"
    >
      {label}
    </Button>
  );
}
