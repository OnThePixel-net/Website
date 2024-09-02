import React from "react";
import TopPage from "@/components/page/top";

export default function TNTRun() {
  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-4xl font-bold mb-5 text-center">TNT Run</h1>
          <h2 className="text-2xl font-semibold mb-4 text-center">Willkommen auf tntrun.de</h2>
          
          <div className="text-gray-300 max-w-4xl mx-auto text-center">
            <p className="mb-8">
              TNT Run ist ein spannendes Minigame, bei dem Spieler auf Blöcken laufen, die kurz nach dem Betreten verschwinden. Dein Ziel ist es, so lange wie möglich zu überleben, während der Boden unter deinen Füßen verschwindet. Kannst du der letzte Überlebende sein?
            </p>
            <p className="mb-8">
              Auf tntrun.de bieten wir dir eine Vielzahl von Karten und Herausforderungen, die dich und deine Freunde stundenlang unterhalten werden. Werde Teil unserer wachsenden Community und messe dich mit Spielern aus aller Welt.
            </p>
            <p className="mb-8">
              Unsere Server sind optimiert für schnelles Gameplay und bieten eine stabile, lagfreie Erfahrung. Ob du ein erfahrener TNT Run-Veteran oder ein Neuling bist, es gibt immer eine Herausforderung, die auf dich wartet!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-2xl font-semibold mb-2">Schnelles Gameplay</h3>
              <p className="text-gray-400">Erlebe rasante Action mit blitzschnellen Reflexen.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-2xl font-semibold mb-2">Vielfältige Maps</h3>
              <p className="text-gray-400">Spiele auf verschiedenen Karten mit einzigartigen Designs.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-2xl font-semibold mb-2">Community & Rankings</h3>
              <p className="text-gray-400">Tritt gegen andere Spieler an und erklimme die Bestenlisten.</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <h2 className="text-3xl font-semibold mb-4">Jetzt mitmachen!</h2>
            <p className="text-gray-300 max-w-xl mx-auto mb-6">
              Werde Teil der TNT Run-Community und messe dich mit den Besten. Besuche unsere Website <a href="https://tntrun.de" className="text-blue-400 underline">tntrun.de</a> und starte noch heute!
            </p>
            <a href="https://tntrun.de" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg">
              Jetzt Spielen
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
