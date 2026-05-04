import type { Metadata } from "next";
import TopPage from "@/components/page/top";
import { getServerLocale } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/i18n/seo";

const META_COPY = {
  en: {
    title: "TNT Run",
    description:
      "Run for your life as the floor disappears beneath your feet. Be the last player standing on OnThePixel.net.",
  },
  de: {
    title: "TNT Run",
    description:
      "Lauf um dein Leben, während der Boden unter deinen Füßen verschwindet. Sei der letzte Spieler auf OnThePixel.net.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { title, description } = META_COPY[locale];
  return buildLocalizedMetadata({ locale, path: "/tntrun", title, description });
}

export default async function Page() {
  const locale = await getServerLocale();
  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          {locale === "de" ? <TntRunDE /> : <TntRunEN />}
        </div>
      </section>
    </>
  );
}

function TntRunEN() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-5">TNT RUN</h1>
      <p className="mb-8">
        Run for your life as the floor disappears beneath your feet! Be the
        last player standing on this crumbling arena.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card icon="💥" title="Disappearing Floor">
          The blocks you step on vanish after a short delay. Keep moving or fall into the void!
        </Card>
        <Card icon="🏃" title="Survival Challenge">
          Outlast other players as the arena gets smaller. Use strategy and quick thinking to survive.
        </Card>
        <Card icon="🏆" title="Rewards">
          Earn Pixels for winning and completing daily quests. Unlock cosmetics and climb the leaderboards!
        </Card>
      </div>

      <Panel title="Game Information" inner="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Stat value="16" label="Max Players" color="text-green-400" />
        <Stat value="1-3min" label="Round Length" color="text-blue-400" />
        <Stat value="3-6" label="Layers" color="text-purple-400" />
      </Panel>

      <Panel title="How to Play">
        <TwoColList
          left={["Basic Rules", [
            "Blocks disappear shortly after you step on them",
            "Keep moving to avoid falling",
            "Last player standing wins the round",
            "Falling into the void eliminates you",
          ]]}
          right={["Pro Tips", [
            "Plan your route ahead of time",
            "Cut off other players' paths",
            "Stay near the center when possible",
            "Don't panic - think strategically",
          ]]}
        />
      </Panel>

      <Panel title="Features">
        <FeatureGrid items={[
          ["Daily Quests", "Complete challenges for extra Pixels and special rewards"],
          ["Cosmetics", "Unlock particle effects, trails, and other visual upgrades"],
          ["Multiple Maps", "Experience different arena layouts and challenges"],
        ]} />
      </Panel>

      <Panel title="Winning Strategies">
        <TwoColList
          left={["Movement", [
            "Keep moving but don't sprint unnecessarily",
            "Use corners and edges strategically",
            "Watch where other players are going",
            "Save sprint for emergency escapes",
          ]]}
          right={["Tactics", [
            "Block off narrow passages",
            "Force opponents into bad positions",
            "Stay calm under pressure",
            "Learn the timing of block destruction",
          ]]}
        />
      </Panel>

      <CallToAction
        title="Ready to Run?"
        text="Join TNT Run and test your survival skills! Can you be the last one standing as the floor crumbles away? Earn Pixels, complete quests, and unlock awesome cosmetics!"
      />
    </>
  );
}

function TntRunDE() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-5">TNT RUN</h1>
      <p className="mb-8">
        Lauf um dein Leben, während der Boden unter deinen Füßen verschwindet!
        Sei der letzte Spieler in dieser bröckelnden Arena.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card icon="💥" title="Verschwindender Boden">
          Die Blöcke, auf die du trittst, verschwinden nach kurzer Verzögerung. Bleib in Bewegung oder falle ins Leere!
        </Card>
        <Card icon="🏃" title="Überlebens-Herausforderung">
          Überlebe länger als die anderen, während die Arena kleiner wird. Nutze Strategie und schnelles Denken, um zu bestehen.
        </Card>
        <Card icon="🏆" title="Belohnungen">
          Verdiene Pixels für Siege und das Abschließen täglicher Quests. Schalte Kosmetika frei und steige in den Bestenlisten auf!
        </Card>
      </div>

      <Panel title="Spielinformationen" inner="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Stat value="16" label="Max. Spieler" color="text-green-400" />
        <Stat value="1–3 Min" label="Rundenlänge" color="text-blue-400" />
        <Stat value="3–6" label="Ebenen" color="text-purple-400" />
      </Panel>

      <Panel title="So wird gespielt">
        <TwoColList
          left={["Grundregeln", [
            "Blöcke verschwinden kurz, nachdem du sie betrittst",
            "Bleib in Bewegung, um nicht zu fallen",
            "Der letzte verbleibende Spieler gewinnt die Runde",
            "Wer ins Leere fällt, scheidet aus",
          ]]}
          right={["Profi-Tipps", [
            "Plane deine Route im Voraus",
            "Schneide den Weg anderer Spieler ab",
            "Bleib wenn möglich in der Mitte",
            "Bleib ruhig — denke strategisch",
          ]]}
        />
      </Panel>

      <Panel title="Features">
        <FeatureGrid items={[
          ["Tägliche Quests", "Schließe Herausforderungen für zusätzliche Pixels und besondere Belohnungen ab"],
          ["Kosmetika", "Schalte Partikeleffekte, Spuren und andere visuelle Upgrades frei"],
          ["Mehrere Maps", "Erlebe unterschiedliche Arena-Layouts und Herausforderungen"],
        ]} />
      </Panel>

      <Panel title="Gewinn-Strategien">
        <TwoColList
          left={["Bewegung", [
            "Bleib in Bewegung, aber sprinte nicht unnötig",
            "Nutze Ecken und Kanten gezielt",
            "Beobachte, wohin andere Spieler laufen",
            "Spare Sprint für Notfall-Fluchten",
          ]]}
          right={["Taktik", [
            "Blockiere schmale Durchgänge",
            "Dränge Gegner in schlechte Positionen",
            "Bleib unter Druck ruhig",
            "Lerne die Timings der Blockzerstörung",
          ]]}
        />
      </Panel>

      <CallToAction
        title="Bereit zu laufen?"
        text="Spring in TNT Run und teste deine Überlebensfähigkeiten! Schaffst du es, als Letzter stehen zu bleiben, während der Boden zerbröckelt? Verdiene Pixels, schließe Quests ab und schalte coole Kosmetika frei!"
      />
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

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
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
          {left[1].map((line) => <li key={line}>• {line}</li>)}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold text-red-400 mb-2">{right[0]}</h3>
        <ul className="space-y-1 text-sm text-gray-300">
          {right[1].map((line) => <li key={line}>• {line}</li>)}
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

function CallToAction({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-12 p-6 bg-white/10 rounded-lg border-l-4 border-green-500">
      <h2
        className="text-lg font-bold text-green-500"
        style={{ color: "#00de6d", textShadow: "0 0 10px #00de6d" }}
      >
        {title}
      </h2>
      <p className="mt-2">{text}</p>
      <div className="mt-4">
        <span className="inline-block bg-gray-800 rounded-md px-3 py-1 text-sm font-mono text-green-400">
          play.tntrun.de
        </span>
      </div>
    </div>
  );
}
