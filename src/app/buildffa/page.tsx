import TopPage from "@/components/page/top";

export default function Page() {
  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">BUILDFFA</h1>
          <p className="mb-8">
            Knockback FFA with building! Fight with powerful weapons and use blocks to your advantage. 
            Survive the action with changing kits, maps, and item drops.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Knockback Combat */}
            <div className="bg-white/5 rounded-lg overflow-hidden transition-transform hover:scale-105 duration-300">
              <div className="p-5">
                <div className="text-3xl mb-3">⚔️</div>
                <h2 className="text-xl font-bold mb-3">Knockback FFA</h2>
                <p className="text-sm text-gray-300">
                  Fight with knockback weapons! Push opponents off the map while using blocks to defend and gain advantage.
                </p>
              </div>
            </div>

            {/* Block Building */}
            <div className="bg-white/5 rounded-lg overflow-hidden transition-transform hover:scale-105 duration-300">
              <div className="p-5">
                <div className="text-3xl mb-3">🧱</div>
                <h2 className="text-xl font-bold mb-3">Strategic Building</h2>
                <p className="text-sm text-gray-300">
                  Place blocks to create bridges, walls, or traps. Use building to outplay opponents and survive longer.
                </p>
              </div>
            </div>

            {/* Item Drops */}
            <div className="bg-white/5 rounded-lg overflow-hidden transition-transform hover:scale-105 duration-300">
              <div className="p-5">
                <div className="text-3xl mb-3">📦</div>
                <h2 className="text-xl font-bold mb-3">Item Drops</h2>
                <p className="text-sm text-gray-300">
                  Every minute, 2 items spawn at random locations. Fight for control of these power-ups to gain the advantage!
                </p>
              </div>
            </div>
          </div>

          {/* Game Stats */}
          <div className="bg-white/10 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Game Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">10min</div>
                <div className="text-sm text-gray-400">Kit Rotation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">10min</div>
                <div className="text-sm text-gray-400">Map Change</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">1min</div>
                <div className="text-sm text-gray-400">Item Drops</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">4</div>
                <div className="text-sm text-gray-400">Spawn Locations</div>
              </div>
            </div>
          </div>

          {/* Game Features */}
          <div className="bg-white/10 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Game Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-green-400 mb-2">Dynamic Gameplay</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Kit changes every 10 minutes for variety</li>
                  <li>• Maps rotate every 10 minutes</li>
                  <li>• Random item drops every minute</li>
                  <li>• 4 different item spawn locations</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-red-400 mb-2">Combat Strategy</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Knockback-focused PvP combat</li>
                  <li>• Strategic block placement</li>
                  <li>• Control valuable item spawns</li>
                  <li>• Survive as long as possible</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tactics Guide */}
          <div className="bg-white/10 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Pro Tips</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-blue-400 mb-2">Building Strategy</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Use blocks to create safe bridges</li>
                  <li>• Build defensive walls during combat</li>
                  <li>• Block off narrow passages to control movement</li>
                  <li>• Create elevated positions for advantage</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-yellow-400 mb-2">Combat Tips</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Time your knockback attacks perfectly</li>
                  <li>• Control the item spawn areas</li>
                  <li>• Adapt your strategy when kits change</li>
                  <li>• Use the map layout to your advantage</li>
                </ul>
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
                  <li>• Different items have different spawn chances</li>
                  <li>• Fight for control of valuable drops</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-orange-400 mb-2">Strategic Value</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Rare items provide significant advantages</li>
                  <li>• Position yourself near spawn points</li>
                  <li>• Time your pushes with item drops</li>
                  <li>• Deny opponents access to power-ups</li>
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
              Ready for Intense Action?
            </h2>
            <p className="mt-2">
              Jump into BuildFFA and experience knockback PvP with strategic building! 
              With changing kits, maps, and item drops, every game brings new challenges.
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
