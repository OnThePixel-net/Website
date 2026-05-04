import type { Metadata } from "next";
import TopPage from "@/components/page/top";
import { getServerLocale } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/i18n/seo";

const META_COPY = {
  en: {
    title: "BedWars",
    description:
      "Protect your bed and destroy your enemies' beds! Team-based PvP combat with strategic resource management on OnThePixel.net.",
  },
  de: {
    title: "BedWars",
    description:
      "Beschütze dein Bett und zerstöre die Betten deiner Gegner! Team-basierte PvP-Kämpfe mit strategischem Ressourcenmanagement auf OnThePixel.net.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { title, description } = META_COPY[locale];
  return buildLocalizedMetadata({ locale, path: "/bedwars", title, description });
}

export default async function Page() {
  const locale = await getServerLocale();
  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36 min-h-screen text-white">
        <div className="container mx-auto px-4 py-10">
          {locale === "de" ? <BedWarsDE /> : <BedWarsEN />}
        </div>
      </section>
    </>
  );
}

function BedWarsEN() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-5">BEDWARS</h1>
      <p className="mb-8">
        Protect your bed and destroy your enemies&apos; beds! Fight in teams and
        conquer the arena in this strategic PvP game.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card icon="⚔️" title="Team Combat">
          Fight with your team against other players. Collect resources and buy
          better equipment!
        </Card>
        <Card icon="🛏️" title="Bed Defense">
          Protect your bed from enemies. Without your bed, you can&apos;t respawn
          anymore!
        </Card>
        <Card icon="🧠" title="Strategy">
          Plan your attacks, manage resources and work together with your team!
        </Card>
      </div>

      <Panel title="Game Information" inner="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Stat value="16" label="Max Players" />
        <Stat value="10-20min" label="Round Length" />
        <Stat value="4" label="Teams" />
      </Panel>

      <Panel title="How to Play">
        <TwoColList
          left={["Basic Rules", [
            "Collect resources from generators",
            "Buy weapons and blocks in the shop",
            "Destroy other teams' beds",
            "Eliminate all enemies to win",
          ]]}
          right={["Pro Tips", [
            "Defend your bed with blocks",
            "Upgrade your generators early",
            "Communicate with your team",
            "Control the middle for diamonds",
          ]]}
        />
      </Panel>

      <Panel title="Features">
        <FeatureGrid items={[
          ["Different Modes", "Solo, Duo and Squad modes for different team sizes"],
          ["Upgrades", "Improve your equipment and abilities during the game"],
          ["Multiple Maps", "Play on unique maps with different layouts"],
        ]} />
      </Panel>

      <Panel title="Winning Strategies">
        <TwoColList
          left={["Early Game", [
            "Collect resources quickly",
            "Buy wool for bed protection",
            "Upgrade your generators",
            "Explore the middle for better resources",
          ]]}
          right={["Late Game", [
            "Plan coordinated team attacks",
            "Use TNT for bed destruction",
            "Control important areas",
            "Prepare for the final battle",
          ]]}
        />
      </Panel>

      <div className="mt-12 p-6 bg-white/10 rounded-lg border-l-4 border-orange-500">
        <h2
          className="text-lg font-bold text-orange-500"
          style={{ color: "#ff8c00", textShadow: "0 0 10px #ff8c00" }}
        >
          Coming Soon!
        </h2>
        <p className="mt-2">
          Bedwars.net is still under development! We&apos;re working hard to bring
          you the best Bedwars experience possible. Stay tuned for updates and
          the official launch!
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="inline-block bg-gray-800 rounded-md px-3 py-1 text-sm font-mono text-orange-400">
            bedwars.net - Coming Soon
          </span>
          <span className="inline-block bg-orange-600/20 rounded-md px-3 py-1 text-sm text-orange-300">
            🚧 In Development
          </span>
        </div>
      </div>
    </>
  );
}

function BedWarsDE() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-5">BEDWARS</h1>
      <p className="mb-8">
        Beschütze dein Bett und zerstöre die Betten deiner Gegner! Kämpfe im
        Team und erobere die Arena in diesem strategischen PvP-Modus.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card icon="⚔️" title="Team-Kampf">
          Kämpfe mit deinem Team gegen andere Spieler. Sammle Ressourcen und
          kaufe bessere Ausrüstung!
        </Card>
        <Card icon="🛏️" title="Bett-Verteidigung">
          Beschütze dein Bett vor Gegnern. Ohne dein Bett kannst du nicht mehr
          respawnen!
        </Card>
        <Card icon="🧠" title="Strategie">
          Plane deine Angriffe, verwalte Ressourcen und arbeite mit deinem
          Team zusammen!
        </Card>
      </div>

      <Panel title="Spielinformationen" inner="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Stat value="16" label="Max. Spieler" />
        <Stat value="10–20 Min" label="Rundenlänge" />
        <Stat value="4" label="Teams" />
      </Panel>

      <Panel title="So wird gespielt">
        <TwoColList
          left={["Grundregeln", [
            "Sammle Ressourcen an den Generatoren",
            "Kaufe Waffen und Blöcke im Shop",
            "Zerstöre die Betten der anderen Teams",
            "Schalte alle Gegner aus, um zu gewinnen",
          ]]}
          right={["Profi-Tipps", [
            "Verteidige dein Bett mit Blöcken",
            "Verbessere deine Generatoren früh",
            "Kommuniziere mit deinem Team",
            "Kontrolliere die Mitte für Diamanten",
          ]]}
        />
      </Panel>

      <Panel title="Features">
        <FeatureGrid items={[
          ["Verschiedene Modi", "Solo-, Duo- und Squad-Modi für unterschiedliche Teamgrößen"],
          ["Upgrades", "Verbessere deine Ausrüstung und Fähigkeiten während des Spiels"],
          ["Mehrere Maps", "Spiele auf einzigartigen Maps mit unterschiedlichen Layouts"],
        ]} />
      </Panel>

      <Panel title="Gewinn-Strategien">
        <TwoColList
          left={["Frühes Spiel", [
            "Sammle schnell Ressourcen",
            "Kaufe Wolle zum Schutz deines Bettes",
            "Verbessere deine Generatoren",
            "Erkunde die Mitte für bessere Ressourcen",
          ]]}
          right={["Spätes Spiel", [
            "Plane koordinierte Team-Angriffe",
            "Nutze TNT, um Betten zu zerstören",
            "Kontrolliere wichtige Bereiche",
            "Bereite dich auf den finalen Kampf vor",
          ]]}
        />
      </Panel>

      <div className="mt-12 p-6 bg-white/10 rounded-lg border-l-4 border-orange-500">
        <h2
          className="text-lg font-bold text-orange-500"
          style={{ color: "#ff8c00", textShadow: "0 0 10px #ff8c00" }}
        >
          Demnächst!
        </h2>
        <p className="mt-2">
          Bedwars.net ist noch in Entwicklung! Wir arbeiten daran, dir das
          bestmögliche BedWars-Erlebnis zu bieten. Bleib dran für Updates und
          den offiziellen Start!
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="inline-block bg-gray-800 rounded-md px-3 py-1 text-sm font-mono text-orange-400">
            bedwars.net – Demnächst
          </span>
          <span className="inline-block bg-orange-600/20 rounded-md px-3 py-1 text-sm text-orange-300">
            🚧 In Entwicklung
          </span>
        </div>
      </div>
    </>
  );
}

function Card({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/5 rounded-lg overflow-hidden transition-transform hover:scale-105 duration-300">
      <div className="p-5">
        <div className="text-3xl mb-3">{icon}</div>
        <h2 className="text-xl font-bold mb-3">{title}</h2>
        <p className="text-sm text-gray-300">{children}</p>
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
  inner,
}: {
  title: string;
  children: React.ReactNode;
  inner?: string;
}) {
  return (
    <div className="bg-white/10 rounded-lg p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {inner ? <div className={inner}>{children}</div> : children}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-green-400">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

function TwoColList({
  left,
  right,
}: {
  left: [string, string[]];
  right: [string, string[]];
}) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h3 className="font-semibold text-green-400 mb-2">{left[0]}</h3>
        <ul className="space-y-1 text-sm text-gray-300">
          {left[1].map((line) => (
            <li key={line}>• {line}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold text-red-400 mb-2">{right[0]}</h3>
        <ul className="space-y-1 text-sm text-gray-300">
          {right[1].map((line) => (
            <li key={line}>• {line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FeatureGrid({ items }: { items: [string, string][] }) {
  const colors = ["text-blue-400", "text-purple-400", "text-yellow-400"];
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {items.map(([title, body], i) => (
        <div key={title}>
          <h3 className={`font-semibold mb-2 ${colors[i % colors.length]}`}>{title}</h3>
          <p className="text-sm text-gray-300">{body}</p>
        </div>
      ))}
    </div>
  );
}

