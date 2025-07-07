import React from "react";
import TopPage from "@/components/page/top";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Shield, Code, Users, Zap, Globe, Lock } from "lucide-react";

interface Project {
  id: number;
  name: string;
  description: string;
  status: "completed" | "in-progress" | "planned";
  category: string;
  icon: React.ReactNode;
  technologies?: string[];
  link?: string;
}

const projects: Project[] = [
  {
    id: 1,
    name: "FastAsFuck",
    description: "Reverse proxy and DDoS protection for Minecraft servers. Keep your server online 24/7 with blazing fast connections.",
    status: "completed",
    category: "Security",
    icon: <Shield className="h-6 w-6" />,
    technologies: ["DDoS Protection", "Global Proxy Network", "Open Source"],
    link: "https://fastasfuck.net"
  },
  {
    id: 2,
    name: "Steyon",
    description: "Steyon is a Minecraft development team specializing in custom server solutions, plugins for the Minecraft community.",
    status: "in-progress",
    category: "Development",
    icon: <Code className="h-6 w-6" />,
    technologies: ["Node.js", "Java", "PostgreSQL", "Docker", "MariaDB"],
  },
  {
    id: 3,
    name: "McStatus.eu",
    description: "An open source and free Minecraft status monitoring service. Check server availability and performance in real-time.",
    status: "in-progress",
    category: "Infrastructure",
    icon: <Zap className="h-6 w-6" />,
    technologies: ["API", "Node.js", "Open Source", "Free"],
    link: "https://McStatus.eu"
  },
  {
    id: 4,
    name: "McWith.me",
    description: "An open source and free Minecraft world hosting solution. Share your worlds seamlessly with friends and communities.",
    status: "planned",
    category: "Infrastructure",
    icon: <Globe className="h-6 w-6" />,
    technologies: ["Minecraft", "Go", "Open Source", "Free"],
    link: "https://mcwith.me"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-600 text-white";
    case "in-progress":
      return "bg-yellow-600 text-white";
    case "planned":
      return "bg-blue-600 text-white";
    default:
      return "bg-gray-600 text-white";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "completed":
      return "Completed";
    case "in-progress":
      return "In Progress";
    case "planned":
      return "Planned";
    default:
      return "Unknown";
  }
};

export default function SiteQuests() {
  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">OUR SITE QUESTS</h1>
          <p className="mb-8 text-gray-400">
            Explore the exciting projects and initiatives that power OnThePixel.net. 
            From cutting-edge security solutions to performance optimizations, 
            discover the technology that makes our server exceptional.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className="bg-gray-900/50 border-gray-800 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-900/20"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="text-green-500">
                        {project.icon}
                      </div>
                      <CardTitle className="text-xl">{project.name}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusText(project.status)}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-400">
                    {project.category}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    {project.description}
                  </p>
                  
                  {project.technologies && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-400 mb-2">Technologies:</p>
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((tech, index) => (
                          <Badge 
                            key={index}
                            variant="outline" 
                            className="text-xs border-gray-700 text-gray-300"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {project.link && project.status === "completed" && (
                    <div className="mt-4">
                      <Link href={project.link} target="_blank" rel="noopener noreferrer">
                        <Button 
                          size="sm" 
                          className="bg-green-700 hover:bg-green-600 text-white"
                        >
                          View Project
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 p-6 bg-white/10 rounded-lg border-l-4 border-green-500">
            <h2 
              className="text-lg font-bold text-green-500" 
              style={{ color: "#00de6d", textShadow: "0 0 10px #00de6d" }}
            >
              Want to Contribute?
            </h2>
            <p className="mt-2 text-gray-300">
              Are you a talented developer interested in contributing to OnThePixel's projects? 
              We're always looking for passionate individuals to join our development team. 
              Join our Discord server and open a ticket to discuss collaboration opportunities.
            </p>
            <div className="mt-4 flex gap-4">
              <Link 
                href="https://discord.com/invite/Dpx3eK9t3z" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button className="bg-green-700 text-white hover:bg-green-600 transition-colors">
                  Join Our Discord
                </Button>
              </Link>
              <Link 
                href="https://github.com/onthepixel-net" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button 
                  variant="outline" 
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  View on GitHub
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
