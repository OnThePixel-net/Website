import TopPage from "@/components/page/top";

export default function Page() {
  return (
    <section className="bg-gray-950 min-h-screen text-white">
      <TopPage />
      <div className="container mx-auto px-4 py-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            BuildFFA
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Kämpfe in selbstgebauten Arenen! Kombiniere kreatives Bauen mit intensivem PvP.
          </p>
        </div>

        {/* Key Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors">
            <div className="text-3xl mb-4">🏗️</div>
            <h3 className="text-xl font-semibold mb-3 text-blue-400">Baue deine Arena</h3>
            <p className="text-gray-300">
              Erstelle deine eigene Kampfarena mit den verfügbaren Blöcken und gestalte das perfekte Schlachtfeld.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-red-500 transition-colors">
            <div className="text-3xl mb-4">⚔️</div>
            <h3 className="text-xl font-semibold mb-3 text-red-400">Free-For-All PvP</h3>
            <p className="text-gray-300">
              Kämpfe gegen alle anderen Spieler! Jeder gegen jeden in epischen Schlachten.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-green-500 transition-colors">
            <div className="text-3xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold mb-3 text-green-400">Belohnungen</h3>
            <p className="text-gray-300">
              Sammle Kills und Punkte, um im Leaderboard aufzusteigen und exklusive Belohnungen zu erhalten.
            </p>
          </div>
        </div>

        {/* Game Rules Section */}
        <div className="bg-gray-800 rounded-lg p-8 mb-12 border border-gray-700">
          <h2 className="text-3xl font-bold mb-6 text-center">Spielregeln</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-blue-400">Build-Phase</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  Baue deine Arena in der vorgegebenen Zeit
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  Nutze alle verfügbaren Blöcke strategisch
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  Bereite Verstecke und Vorteilspositionen vor
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-red-400">Fight-Phase</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">⚔</span>
                  Alle gegen alle - keine Teams!
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">⚔</span>
                  Letzter Überlebender gewinnt die Runde
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">⚔</span>
                  Nutze deine gebaute Arena zu deinem Vorteil
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold mb-2">∞</div>
            <div className="text-sm text-blue-100">Runden pro Tag</div>
          </div>
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold mb-2">24/7</div>
            <div className="text-sm text-green-100">Verfügbar</div>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold mb-2">16</div>
            <div className="text-sm text-purple-100">Max. Spieler</div>
          </div>
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold mb-2">5min</div>
            <div className="text-sm text-orange-100">Build-Zeit</div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-8 border border-gray-600">
          <h2 className="text-3xl font-bold mb-6 text-center">Pro-Tipps</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="text-yellow-400 text-xl mr-3">💡</span>
                <div>
                  <h4 className="font-semibold text-yellow-400">Verteidigungsposition</h4>
                  <p className="text-gray-300 text-sm">Baue erhöhte Positionen für bessere Übersicht und Schutz</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-yellow-400 text-xl mr-3">💡</span>
                <div>
                  <h4 className="font-semibold text-yellow-400">Fluchtrouten</h4>
                  <p className="text-gray-300 text-sm">Plane immer mehrere Auswege aus deiner Position</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="text-yellow-400 text-xl mr-3">💡</span>
                <div>
                  <h4 className="font-semibold text-yellow-400">Fallen bauen</h4>
                  <p className="text-gray-300 text-sm">Nutze versteckte Löcher und Hindernisse gegen deine Gegner</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-yellow-400 text-xl mr-3">💡</span>
                <div>
                  <h4 className="font-semibold text-yellow-400">Resource Management</h4>
                  <p className="text-gray-300 text-sm">Teile deine Blöcke klug ein - du hast nur begrenzte Ressourcen</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-4">Bereit für den Kampf?</h2>
            <p className="text-xl mb-6 text-purple-100">
              Verbinde dich mit dem OnThePixel Server und starte dein BuildFFA Abenteuer!
            </p>
            <div className="bg-black bg-opacity-50 rounded-lg p-4 max-w-md mx-auto">
              <code className="text-green-400 text-lg font-mono">play.onthepixel.net</code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
