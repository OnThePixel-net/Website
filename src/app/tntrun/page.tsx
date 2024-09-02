import React from "react";
import TopPage from "@/components/page/top";

export default function TNTRun() {
  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36 pb-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6 text-white">TNT Run</h1>
          <p className="text-gray-300 text-lg mb-8 max-w-3xl mx-auto">
            In TNT Run, your goal is to avoid falling TNT and stay on the highest platform for as long as possible. Whether you're a beginner or a pro, there's always something for everyone!
          </p>
          <p className="text-gray-300 text-lg mb-8 max-w-3xl mx-auto">
            Our TNT Run features exciting PvP opportunities and the ability to use double jumps to avoid falling. Win the game and earn our server currency, "Pixels," to enhance your experience!
          </p>
          <a href="https://tntrun.de" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg">
            Play Now
          </a>
        </div>
      </section>
    </>
  );
}
