import TopPage from "@/components/page/top";
import { getServerLocale } from "@/lib/i18n/server";

export default async function Page() {
  const locale = await getServerLocale();
  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          {locale === "de" ? <BuildFFADE /> : <BuildFFAEN />}
        </div>
      </section>
    </>
  );
}

function BuildFFAEN() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-5">BUILDFFA</h1>
      <p className="mb-8">
        Free-for-all combat with building! Fight other players and use blocks to your advantage.
        Endless rounds with kit changes, map rotations, and valuable item drops.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card icon="⚔️" title="Free-for-All Combat">
          Fight against all other players! Use your weapons and building skills to get kills and climb the leaderboard.
        </Card>
        <Card icon="🧱" title="Building with Blocks">
          Place blocks to create bridges, walls, or traps. Blocks disappear after some time, keeping the map clean and fresh.
        </Card>
        <Card icon="📦" title="Item Drops">
          Every minute, 2 items spawn at random locations. Fight for control of these power-ups to get the advantage!
        </Card>
      </div>

      <Panel title="Game Information" inner="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat value="∞" label="Endless Rounds" color="text-green-400" />
        <Stat value="10min" label="Kit Changes" color="text-blue-400" />
        <Stat value="10min" label="Map Changes" color="text-purple-400" />
        <Stat value="1min" label="Item Drops" color="text-orange-400" />
      </Panel>

      <Panel title="How to Play">
        <TwoColList
          left={["Basic Gameplay", [
            "Drop into the map and start fighting",
            "Kill other players to increase your score",
            "Use blocks to build bridges and defenses",
            "Respawn automatically when you die",
          ]]}
          right={["Advanced Tips", [
            "Blocks disappear after some time",
            "Control the item spawn areas",
            "Adapt when kits change every 10 minutes",
            "Learn the map layouts",
          ]]}
        />
      </Panel>

      <Panel title="Features">
        <FeatureGrid items={[
          ["Endless Action", "No round limits - just continuous fighting and building"],
          ["Killstreak Tracking", "Build up killstreaks and compete on the leaderboards"],
          ["Dynamic Maps", "Maps and kits change regularly to keep gameplay fresh"],
        ]} />
      </Panel>

      <Panel title="Item Drop System">
        <TwoColList
          left={["Drop Mechanics", [
            "2 items drop every minute",
            "4 possible spawn locations per map",
            "Different items have different chances",
            "Fight others for the best items",
          ]]}
          right={["Strategy", [
            "Rare items give big advantages",
            "Control spawn areas when possible",
            "Time your pushes with item drops",
            "Deny enemies access to power-ups",
          ]]}
        />
      </Panel>

      <CallToAction
        title="Ready to Fight?"
        text="Jump into BuildFFA and experience non-stop PvP action with building! With changing kits, maps, and item drops, every fight is different."
      />
    </>
  );
}

function BuildFFADE() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-5">BUILDFFA</h1>
      <p className="mb-8">
        Free-for-All-Kämpfe mit Bauen! Kämpfe gegen andere Spieler und nutze Blöcke zu deinem Vorteil.
        Endlose Runden mit Kit-Wechseln, Map-Rotationen und wertvollen Item-Drops.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card icon="⚔️" title="Free-for-All-Kampf">
          Kämpfe gegen alle anderen Spieler! Nutze deine Waffen und Bau-Fähigkeiten, um Kills zu erzielen und in der Bestenliste aufzusteigen.
        </Card>
        <Card icon="🧱" title="Bauen mit Blöcken">
          Platziere Blöcke, um Brücken, Mauern oder Fallen zu bauen. Blöcke verschwinden nach einiger Zeit und halten die Map sauber.
        </Card>
        <Card icon="📦" title="Item-Drops">
          Jede Minute spawnen 2 Items an zufälligen Orten. Kämpfe um die Kontrolle dieser Power-Ups, um dir einen Vorteil zu sichern!
        </Card>
      </div>

      <Panel title="Spielinformationen" inner="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat value="∞" label="Endlose Runden" color="text-green-400" />
        <Stat value="10 Min" label="Kit-Wechsel" color="text-blue-400" />
        <Stat value="10 Min" label="Map-Wechsel" color="text-purple-400" />
        <Stat value="1 Min" label="Item-Drops" color="text-orange-400" />
      </Panel>

      <Panel title="So wird gespielt">
        <TwoColList
          left={["Grundlegender Ablauf", [
            "Spawne in die Map und beginne zu kämpfen",
            "Töte andere Spieler, um deinen Punktestand zu erhöhen",
            "Baue mit Blöcken Brücken und Verteidigungen",
            "Du respawnst automatisch, wenn du stirbst",
          ]]}
          right={["Fortgeschrittene Tipps", [
            "Blöcke verschwinden nach einiger Zeit",
            "Kontrolliere die Item-Spawn-Bereiche",
            "Passe dich an, wenn die Kits alle 10 Minuten wechseln",
            "Lerne die Layouts der Maps",
          ]]}
        />
      </Panel>

      <Panel title="Features">
        <FeatureGrid items={[
          ["Endlose Action", "Keine Rundenlimits — nur kontinuierliches Kämpfen und Bauen"],
          ["Killstreak-Tracking", "Baue Killstreaks auf und tritt in den Bestenlisten an"],
          ["Dynamische Maps", "Maps und Kits wechseln regelmäßig, damit das Spiel frisch bleibt"],
        ]} />
      </Panel>

      <Panel title="Item-Drop-System">
        <TwoColList
          left={["Drop-Mechanik", [
            "2 Items droppen jede Minute",
            "4 mögliche Spawn-Orte pro Map",
            "Unterschiedliche Items haben unterschiedliche Chancen",
            "Kämpfe gegen andere um die besten Items",
          ]]}
          right={["Strategie", [
            "Seltene Items bringen große Vorteile",
            "Kontrolliere wenn möglich die Spawn-Bereiche",
            "Time deine Angriffe mit den Item-Drops",
            "Halte Gegner von Power-Ups fern",
          ]]}
        />
      </Panel>

      <CallToAction
        title="Bereit zu kämpfen?"
        text="Spring in BuildFFA und erlebe Non-Stop-PvP-Action mit Bauen! Durch wechselnde Kits, Maps und Item-Drops ist jeder Kampf anders."
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
          play.buildffa.net
        </span>
      </div>
    </div>
  );
}
