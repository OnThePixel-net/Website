import TopPage from "@/components/page/top";

export default function Page() {
  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">TNT RUN</h1>
          <p className="mb-8">
            Run for your life as the floor disappears beneath your feet! 
            Be the last player standing on this crumbling arena.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Disappearing Floor */}
            <div className="bg-white/5 rounded-lg overflow-hidden transition-transform hover:scale-105 duration-300">
              <div className="p-5">
                <div className="text-3xl mb-3">💥</div>
                <h2 className="text-xl font-bold mb-3">Disappearing Floor</h2>
                <p className="text-sm text-gray-300">
                  The blocks you step on vanish after a short delay. Keep moving or fall into the void!
                </p>
              </div>
            </div>

            {/* Survival Challenge */}
            <div className="bg-white/5 rounded-lg overflow-hidden transition-transform hover:scale-105 duration-300">
              <div className="p-5">
                <div className="text-3xl mb-3">🏃</div>
                <h2 className="text-xl font-bold mb-3">Survival Challenge</h2>
                <p className="text-sm text-gray-300">
                  Outlast other players as the arena gets smaller. Use strategy and quick thinking to survive.
                </p>
              </div>
            </div>

            {/* Rewards */}
            <div className="bg-white/5 rounded-lg overflow-hidden transition-transform hover:scale-105 duration-300">
              <div className="p-5">
                <div className="text-3xl mb-3">🏆</div>
                <h2 className="text-xl font-bold mb-3">Rewards</h2>
                <p className="text-sm text-gray-300">
                  Earn Pixels for winning and completing daily quests. Unlock cosmetics and climb the leaderboards!
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
                <div className="text-2xl font-bold text-blue-400">1-3min</div>
                <div className="text-sm text-gray-400">Round Length</div>
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
                <h3 className="font-semibold text-green-400 mb-2">Basic Rules</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Blocks disappear shortly after you step on them</li>
                  <li>• Keep moving to avoid falling</li>
                  <li>• Last player standing wins the round</li>
                  <li>• Falling into the void eliminates you</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-red-400 mb-2">Pro Tips</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Plan your route ahead of time</li>
                  <li>• Cut off other players' paths</li>
                  <li>• Stay near the center when possible</li>
                  <li>• Don't panic - think strategically</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Game Features */}
          <div className="bg-white/10 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Features</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold text-blue-400 mb-2">Daily Quests</h3>
                <p className="text-sm text-gray-300">Complete challenges for extra Pixels and special rewards</p>
              </div>
              <div>
                <h3 className="font-semibold text-purple-400 mb-2">Cosmetics</h3>
                <p className="text-sm text-gray-300">Unlock particle effects, trails, and other visual upgrades</p>
              </div>
              <div>
                <h3 className="font-semibold text-yellow-400 mb-2">Multiple Maps</h3>
                <p className="text-sm text-gray-300">Experience different arena layouts and challenges</p>
              </div>
            </div>
          </div>

          {/* Strategy Guide */}
          <div className="bg-white/10 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Winning Strategies</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-blue-400 mb-2">Movement</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Keep moving but don't sprint unnecessarily</li>
                  <li>• Use corners and edges strategically</li>
                  <li>• Watch where other players are going</li>
                  <li>• Save sprint for emergency escapes</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-orange-400 mb-2">Tactics</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Block off narrow passages</li>
                  <li>• Force opponents into bad positions</li>
                  <li>• Stay calm under pressure</li>
                  <li>• Learn the timing of block destruction</li>
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
              Ready to Run?
            </h2>
            <p className="mt-2">
              Join TNT Run and test your survival skills! Can you be the last one standing as the floor crumbles away? 
              Earn Pixels, complete quests, and unlock awesome cosmetics!
            </p>
            <div className="mt-4">
              <span className="inline-block bg-gray-800 rounded-md px-3 py-1 text-sm font-mono text-green-400">
                play.tntrun.de
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
