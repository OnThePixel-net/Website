import React from "react";
import Link from "next/link";
import TopPage from "@/components/page/top";
import ApplicationForm, { ApplicationField } from "@/components/page/ApplicationForm";

const fields: ApplicationField[] = [
  {
    id: "minecraft_username",
    label: "Minecraft Username",
    type: "text",
    placeholder: "Your current IGN",
  },
  {
    id: "why_supporter",
    label: "Why do you want to be a Supporter?",
    type: "textarea",
    placeholder: "Tell us why you'd like to join the support team...",
  },
  {
    id: "experience",
    label: "Previous Experience",
    type: "textarea",
    placeholder: "Have you been a moderator or supporter before? Describe your experience...",
  },
];

async function isPositionOpen(name: string): Promise<boolean> {
  try {
    const res = await fetch("https://cms.onthepixel.net/items/Apply", { cache: "no-store" });
    const data = await res.json();
    const position = (data.data ?? []).find((p: { name: string; status: string }) => p.name === name);
    return position?.status === "open";
  } catch {
    return false;
  }
}

export default async function SupporterApplicationPage() {
  const open = await isPositionOpen("Supporter");

  return (
    <>
      <TopPage />
      {open ? (
        <ApplicationForm position="Supporter" fields={fields} apiEndpoint="supporter" />
      ) : (
        <ClosedNotice position="Supporter" />
      )}
    </>
  );
}

function ClosedNotice({ position }: { position: string }) {
  return (
    <section className="bg-gray-950 min-h-screen">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-xl mx-auto">
          <Link
            href="/apply"
            className="inline-block mb-6 text-sm text-gray-400 hover:text-green-400 transition-colors duration-200"
          >
            ← Back to Positions
          </Link>
          <div className="bg-white/5 rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold mb-3">{position} Applications Closed</h1>
            <p className="text-gray-400 mb-6">
              We&apos;re not currently accepting {position} applications. Check back later or follow us on Discord for updates.
            </p>
            <Link
              href="/apply"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              View All Positions
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
