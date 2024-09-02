import React from "react";
import TopPage from "@/components/page/top";

export default function TNTRun() {
  return (
    <>
     
      <section className="bg-gray-950 pt-36 pb-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6 text-white">TNT Run</h1>
          <p className="text-gray-300 text-lg mb-8 max-w-3xl mx-auto">
            In TNT Run geht es darum, dem unter dir fallenden TNT zu entkommen und so lange wie möglich auf der höchsten Plattform zu bleiben. Ob Anfänger oder Profi, bei uns ist für jeden etwas dabei!
          </p>
          <p className="text-gray-300 text-lg mb-8 max-w-3xl mx-auto">
            Unser TNT Run bietet dir spannende PvP-Möglichkeiten und die Chance, Double Jumps zu nutzen, um dich vor dem Sturz zu retten. Gewinne das Spiel und sammle die Server-Währung „Pixels“, um dich weiter zu verbessern!
          </p>
          <a href="https://tntrun.de" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg">
            Jetzt Spielen
          </a>
        </div>
      </section>
    </>
  );
}
