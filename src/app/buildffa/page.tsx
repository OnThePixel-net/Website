import TopPage from "@/components/page/top";

export default function Page() {
  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">BUILDFFA</h1>
          <p className="mb-8">
            Build your arena, then fight! Combine creative building with intense PvP combat in our unique BuildFFA gamemode.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Build Phase */}
            <div className="bg-white/5 rounded-lg overflow-hidden transition-transform hover:scale-105 duration-300">
              <div className="p-5">
                <div className="text-3xl mb-3">🏗️</div>
                <h2 className="text-xl font-bold mb-3">Build Phase</h2>
                <p className="text-sm text-gray-300">
                  You have 5 minutes to build your perfect arena. Use blocks strategically to create defensive positions, traps, and escape routes.
                </p>
              </div>
            </div>

            {/* Fight Phase */}
            <div className="bg-white/5 rounded-lg overflow-hidden transition-transform hover:scale-105 duration-300">
              <div className="p-5">
                <div className="text-3xl mb-3">⚔️</div>
                <h2 className="text-xl font-bold mb-3">Fight Phase</h2>
                <p className="text-sm text-gray-300">
                  Free-for-all combat! Use your built environment to your advantage. Last player standing wins the round.
                </p>
              </div>
            </div>

            {/* Rewards */}
            <div className="bg-white/5 rounded-lg overflow-hidden transition-transform hover:scale-105 duration-300">
              <div className="p-5">
                <div className="text-3xl mb-3">🏆</div>
                <h2 className="text-xl font-bold mb-3">Rewards</h2>
                <p className="text-sm text-gray-300">
                  Earn Pixels for kills and wins. Climb the leaderboards and unlock exclusive cosmetics and perks.
                </p>
              </div>
            </div>
          </div>

          {/* Game Stats */}
          <div className="bg-white/10 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Game Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">16</div>
                <div className="text-sm text-gray-400">Max Players</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">5min</div>
                <div className="text-sm text-gray-400">Build Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">24/7</div>
                <div className="text-sm text-gray-400">Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">∞</div>
                <div className="text-sm text-gray-400">Rounds/Day</div>
              </div>
            </div>
          </div>

          {/* How to Play */}
          <div className="bg-white/10 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">How to Play</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-green-400 mb-2">Build Phase (5 minutes)</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Build your arena with the provided blocks</li>
                  <li>• Create defensive positions and hiding spots</li>
                  <li>• Set up traps for other players</li>
                  <li>• Plan multiple escape routes</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-red-400 mb-2">Fight Phase</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Free-for-all combat begins</li>
                  <li>• Use your built environment strategically</li>
                  <li>• Eliminate other players to win</li>
                  <li>• Last player standing wins the round</li>
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
              Ready to Build and Fight?
            </h2>
            <p className="mt-2">
              Join OnThePixel.net now and test your building and combat skills in BuildFFA! 
              Compete with players from around the world and climb the leaderboards.
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
