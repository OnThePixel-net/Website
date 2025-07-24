import Link from "next/link";
import React from "react";
import TopPage from "@/components/page/top";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function ApplyPage() {
  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">JOIN OUR TEAM</h1>
          <p className="mb-8 text-gray-400">
            Become part of the OnThePixel.net team! We're always looking for talented individuals 
            to help us create amazing experiences for our players.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Builder Position */}
            <PositionCard 
              title="Builder"
              description="Create stunning worlds and game maps for our Minecraft server. Experience with WorldEdit and Voxel tools preferred."
              link="/apply/builder"
              enabled={true}
              urgent={false}
              requirements={["WorldEdit experience", "Creative building skills", "Portfolio required"]}
            />
            
            {/* Developer Position */}
            <PositionCard 
              title="Java Developer"
              description="Develop plugins and features for our Minecraft server. Experience with Spigot/Paper and Java required."
              link="/apply/developer"
              enabled={true}
              urgent={true}
              requirements={["Java programming", "Spigot/Paper knowledge", "3+ years experience"]}
            />
            
            {/* Web Developer Position */}
            <PositionCard 
              title="Web Developer"
              description="Help us build and maintain our website and web applications. React/Next.js knowledge required."
              link="/apply/webdev"
              enabled={true}
              urgent={false}
              requirements={["React/Next.js", "TypeScript", "Full-stack experience"]}
            />
            
            {/* Moderator Position */}
            <PositionCard 
              title="Moderator"
              description="Help maintain a positive gaming environment and assist players with their questions and issues."
              link="/apply/moderator"
              enabled={true}
              urgent={false}
              requirements={["Good communication", "Available 20+ hours/week", "Mature attitude"]}
            />
            
            {/* Game Designer Position */}
            <PositionCard 
              title="Game Designer"
              description="Design new game modes and improve existing ones. Create balanced and fun gameplay experiences."
              link="#"
              enabled={false}
              urgent={false}
              requirements={["Game design experience", "Understanding of PvP mechanics", "Creative thinking"]}
            />
            
            {/* Community Manager Position */}
            <PositionCard 
              title="Community Manager"
              description="Manage our social media presence and engage with our community across different platforms."
              link="/apply/community"
              enabled={true}
              urgent={false}
              requirements={["Social media experience", "Content creation", "Community engagement"]}
            />
          </div>
        </div>
      </section>
    </>
  );
}

interface PositionCardProps {
  title: string;
  description: string;
  link: string;
  enabled: boolean;
  urgent?: boolean;
  requirements?: string[];
}

function PositionCard({ title, description, link, enabled, urgent, requirements }: PositionCardProps) {
  const content = (
    <Card className={`h-full border-gray-800 transition-all duration-300 ${enabled ? 'hover:border-green-500 hover:shadow-md hover:shadow-green-900/20' : 'opacity-70'}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">{title}</h2>
          <div className="flex gap-2">
            {urgent && (
              <Badge className="text-sm bg-red-600 text-white border-none">Urgent</Badge>
            )}
            {enabled ? (
              <Badge className="text-sm bg-green-600 text-white border-none">Open</Badge>
            ) : (
              <Badge className="text-sm bg-gray-600 text-white border-none">Closed</Badge>
            )}
          </div>
        </div>
        
        <p className="text-gray-400 mb-4">{description}</p>
        
        {requirements && requirements.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Requirements:</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              {requirements.map((req, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {enabled && (
          <div className="mt-4 flex justify-end">
            <span className="text-green-400 text-sm">Apply now →</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!enabled) {
    return content;
  }

  return (
    <Link href={link} className="block h-full">
      {content}
    </Link>
  );
}
