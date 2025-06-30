import TopPage from "@/components/page/top";

export default function Page() {
  return (
    <>
      <section className="bg-gray-950 pt-36 min-h-screen text-white">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">BEDWARS</h1>
          <p className="mb-8">
            Protect your bed and destroy your enemies' beds! 
            Fight in teams and conquer the arena in this strategic PvP game.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Team Combat */}
            <div className="bg-white/5 rounded-lg overflow-hidden transition-transform hover:scale-105 duration-300">
              <div className="p-5">
                <div className="text-3xl mb-3">⚔️</div>
                <h2 className="text-xl font-bold mb-3">Team Combat</h2>
                <p className="text-sm text-gray-300">
                  Fight with your team against other players. Collect resources and buy better equipment!
                </p>
              </div>
            </div>

            {/* Bed Defense */}
            <div className="bg-white/5 rounded-lg overflow-hidden transition-transform hover:scale-105 duration-300">
              <div className="p-5">
                <div className="text-3xl mb-3">🛏️</div>
                <h2 className="text-xl font-bold mb-3">Bed Defense</h2>
                <p className="text-sm text-gray-300">
                  Protect your bed from enemies. Without your bed, you can't respawn anymore!
                </p>
              </div>
            </div>

            {/* Strategy */}
            <div className="bg-white/5 rounded-lg overflow-hidden transition-transform hover:scale-105 duration-300">
              <div className="p-5">
                <div className="text-3xl mb-3">🧠</div>
                <h2 className="text-xl font-bold mb-3">Strategy</h2>
                <p className="text-sm text-gray-300">
                  Plan your attacks, manage resources and work together with your team!
                </p>
              </div>
            </div>
          </div>

          {/* Game Stats */}
          <div className="bg-white/10 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Game Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">16</div>
                <div className="text-sm text-gray-400">Max Players</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">10-20min</div>
                <div className="text-sm text-gray-400">Round Length</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">4</div>
                <div className="text-sm text-gray-400">Teams</div>
              </div>
            </div>
          </div>

          {/* How to Play */}
          <div className="bg-white/10 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">How to Play</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-green-400 mb-2">Basic Rules</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Collect resources from generators</li>
                  <li>• Buy weapons and blocks in the shop</li>
                  <li>• Destroy other teams' beds</li>
                  <li>• Eliminate all enemies to win</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-red-400 mb-2">Pro Tips</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Defend your bed with blocks</li>
                  <li>• Upgrade your generators early</li>
                  <li>• Communicate with your team</li>
                  <li>• Control the middle for diamonds</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Game Features */}
          <div className="bg-white/10 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Features</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold text-blue-400 mb-2">Different Modes</h3>
                <p className="text-sm text-gray-300">Solo, Duo and Squad modes for different team sizes</p>
              </div>
              <div>
                <h3 className="font-semibold text-purple-400 mb-2">Upgrades</h3>
                <p className="text-sm text-gray-300">Improve your equipment and abilities during the game</p>
              </div>
              <div>
                <h3 className="font-semibold text-yellow-400 mb-2">Multiple Maps</h3>
                <p className="text-sm text-gray-300">Play on unique maps with different layouts</p>
              </div>
            </div>
          </div>

          {/* Strategy Guide */}
          <div className="bg-white/10 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Winning Strategies</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-blue-400 mb-2">Early Game</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Collect resources quickly</li>
                  <li>• Buy wool for bed protection</li>
                  <li>• Upgrade your generators</li>
                  <li>• Explore the middle for better resources</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-orange-400 mb-2">Late Game</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Plan coordinated team attacks</li>
                  <li>• Use TNT for bed destruction</li>
                  <li>• Control important areas</li>
                  <li>• Prepare for the final battle</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Call to Action - Coming Soon */}
          <div className="mt-12 p-6 bg-white/10 rounded-lg border-l-4 border-orange-500">
            <h2 
              className="text-lg font-bold text-orange-500" 
              style={{ color: "#ff8c00", textShadow: "0 0 10px #ff8c00" }}
            >
              Coming Soon!
            </h2>
            <p className="mt-2">
              Bedwars.net is still under development! We're working hard to bring you the best 
              Bedwars experience possible. Stay tuned for updates and the official launch!
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
        </div>
      </section>
    </>
  );
}
