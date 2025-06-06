import TopPage from "@/components/page/top";

export default function Page() {
  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">BUILDFFA</h1>
          <p className="mb-8">
            Free-for-all combat with building! Fight other players and use blocks to your advantage. 
            Endless rounds with kit changes, map rotations, and valuable item drops.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Free-for-All Combat */}
            <div className="bg-white/5 rounded-lg overflow-hidden transition-transform hover:scale-105 duration-300">
              <div className="p-5">
                <div className="text-3xl mb-3">⚔️</div>
                <h2 className="text-xl font-bold mb-3">Free-for-All Combat</h2>
                <p className="text-sm text-gray-300">
                  Fight against all other players! Use your weapons and building skills to get kills and climb the leaderboard.
                </p>
              </div>
            </div>

            {/* Building with Blocks */}
            <div className="bg-white/5 rounded-lg overflow-hidden transition-transform hover:scale-105 duration-300">
              <div className="p-5">
                <div className="text-3xl mb-3">🧱</div>
                <h2 className="text-xl font-bold mb-3">Building with Blocks</h2>
                <p className="text-sm text-gray-300">
                  Place blocks to create bridges, walls, or traps. Blocks disappear after some time, keeping the map clean and fresh.
                </p>
              </div>
            </div>

            {/* Item Drops */}
            <div className="bg-white/5 rounded-lg overflow-hidden transition-transform hover:scale-105 duration-300">
              <div className="p-5">
                <div className="text-3xl mb-3">📦</div>
                <h2 className="text-xl font-bold mb-3">Item Drops</h2>
                <p className="text-sm text-gray-300">
                  Every minute, 2 items spawn at random locations. Fight for control of these power-ups to get the advantage!
                </p>
              </div>
            </div>
          </div>

          {/* Game Stats */}
          <div className="bg-white/10 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Game Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">∞</div>
                <div className="text-sm text-gray-400">Endless Rounds</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">10min</div>
                <div className="text-sm text-gray-400">Kit Changes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">10min</div>
                <div className="text-sm text-gray-400">Map Changes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">1min</div>
                <div className="text-sm text-gray-400">Item Drops</div>
              </div>
            </div>
          </div>

          {/* How to Play */}
          <div className="bg-white/10 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">How to Play</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-green-400 mb-2">Basic Gameplay</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Drop into the map and start fighting</li>
                  <li>• Kill other players to increase your score</li>
                  <li>• Use blocks to build bridges and defenses</li>
                  <li>• Respawn automatically when you die</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-red-400 mb-2">Advanced Tips</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Blocks disappear after some time</li>
                  <li>• Control the item spawn areas</li>
                  <li>• Adapt when kits change every 10 minutes</li>
                  <li>• Learn the map layouts</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Game Features */}
          <div className="bg-white/10 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Features</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold text-blue-400 mb-2">Endless Action</h3>
                <p className="text-sm text-gray-300">No round limits - just continuous fighting and building</p>
              </div>
              <div>
                <h3 className="font-semibold text-purple-400 mb-2">Killstreak Tracking</h3>
                <p className="text-sm text-gray-300">Build up killstreaks and compete on the leaderboards</p>
              </div>
              <div>
                <h3 className="font-semibold text-yellow-400 mb-2">Dynamic Maps</h3>
                <p className="text-sm text-gray-300">Maps and kits change regularly to keep gameplay fresh</p>
              </div>
            </div>
          </div>

          {/* Item System */}
          <div className="bg-white/10 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Item Drop System</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-purple-400 mb-2">Drop Mechanics</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• 2 items drop every minute</li>
                  <li>• 4 possible spawn locations per map</li>
                  <li>• Different items have different chances</li>
                  <li>• Fight others for the best items</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-orange-400 mb-2">Strategy</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Rare items give big advantages</li>
                  <li>• Control spawn areas when possible</li>
                  <li>• Time your pushes with item drops</li>
                  <li>• Deny enemies access to power-ups</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 p-6 bg-white/10 rounded-lg border-l-4 border-green-500">
            <h2 
              className="text-lg font-bold text-green-500" 
              style={{ color: "#00de6d", textShadow: "0 0 10px #00de6d" }}
            >
              Ready to Fight?
            </h2>
            <p className="mt-2">
              Jump into BuildFFA and experience non-stop PvP action with building! 
              With changing kits, maps, and item drops, every fight is different.
            </p>
            <div className="mt-4">
              <span className="inline-block bg-gray-800 rounded-md px-3 py-1 text-sm font-mono text-green-400">
                play.onthepixel.net
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
