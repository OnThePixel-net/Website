import TopPage from "@/components/page/top";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Side Quests – OnThePixel.net",
  description:
    "Explore the side projects and open-source tools built by the OnThePixel team.",
};

interface SideQuest {
  id: number;
  name: string;
  description: string;
  status: "completed" | "in-progress" | "planned";
  category: string;
  technologies?: string[];
  link?: string;
}

async function getSideQuests(): Promise<SideQuest[]> {
  try {
    const res = await fetch("https://cms.onthepixel.net/items/Side_Quests", {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

const statusStyles: Record<string, string> = {
  completed: "bg-green-600 text-white",
  "in-progress": "bg-yellow-600 text-white",
  planned: "bg-blue-600 text-white",
};

const statusLabels: Record<string, string> = {
  completed: "Completed",
  "in-progress": "In Progress",
  planned: "Planned",
};

export default async function SideQuestsPage() {
  const quests = await getSideQuests();

  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="mb-5 text-2xl font-bold">OUR SIDE QUESTS</h1>
          <p className="mb-8 text-gray-400">
            Explore the exciting projects and initiatives that power
            OnThePixel.net. From cutting-edge security solutions to performance
            optimizations, discover the technology that makes our server
            exceptional.
          </p>

          {quests.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {quests.map((quest) => (
                <div
                  key={quest.id}
                  className="flex flex-col rounded-xl border border-gray-800 bg-gray-900/50 p-6 transition-all duration-300 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-900/20"
                >
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <h2 className="text-xl font-bold text-white">
                      {quest.name}
                    </h2>
                    <Badge
                      className={
                        statusStyles[quest.status] ?? "bg-gray-600 text-white"
                      }
                    >
                      {statusLabels[quest.status] ?? quest.status}
                    </Badge>
                  </div>

                  <p className="mb-1 text-sm text-gray-500">{quest.category}</p>
                  <p className="mb-4 flex-1 text-gray-300">
                    {quest.description}
                  </p>

                  {quest.technologies && quest.technologies.length > 0 && (
                    <div className="mb-4">
                      <p className="mb-2 text-sm text-gray-400">
                        Technologies:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {quest.technologies.map((tech) => (
                          <Badge
                            key={tech}
                            variant="outline"
                            className="border-gray-700 text-xs text-gray-300"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {quest.link && (
                    <div className="mt-auto pt-2">
                      <Link
                        href={quest.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          size="sm"
                          className="bg-green-700 text-white hover:bg-green-600"
                        >
                          View Project
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No side quests found.</p>
          )}

          <div className="mt-12 rounded-lg border-l-4 border-green-500 bg-white/10 p-6">
            <h2
              className="text-lg font-bold"
              style={{ color: "#00de6d", textShadow: "0 0 10px #00de6d" }}
            >
              Want to Contribute?
            </h2>
            <p className="mt-2 text-gray-300">
              Are you a talented developer interested in contributing to
              OnThePixel's projects? We're always looking for passionate
              individuals to join our development team. Apply now and become
              part of the team!
            </p>
            <div className="mt-4">
              <Link href="/apply">
                <Button className="bg-green-700 text-white hover:bg-green-600 transition-colors">
                  Apply Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
