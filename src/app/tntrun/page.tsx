import React, { useState } from "react";
import TopPage from "@/components/page/top";

export default function TNTRun() {
  const [copied, setCopied] = useState(false);
  const serverIP = "play.tntrun.de";

  const handleCopy = () => {
    // Create a temporary input element
    const input = document.createElement("input");
    input.value = serverIP;
    document.body.appendChild(input);

    // Select and copy the text
    input.select();
    document.execCommand("copy");

    // Clean up
    document.body.removeChild(input);

    // Show feedback
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset the copied state after 2 seconds
  };

  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36 pb-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 text-white">TNT Run</h1>
          <p className="text-gray-300 text-xl mb-8 max-w-3xl mx-auto">
            In TNT Run, your goal is to avoid falling TNT blocks and stay on the highest platform for as long as possible. Whether you’re a beginner or a pro, there’s always something for you!
          </p>
          <p className="text-gray-300 text-xl mb-8 max-w-3xl mx-auto">
            Our unique TNT Run experience includes exciting PvP battles and double jumps to help you stay in the game. Win to earn "Pixels," the server currency, and boost your in-game progress!
          </p>
          <div className="flex justify-center items-center space-x-4 mt-8">
            <div className="text-white text-lg font-semibold">
              Server IP: <span className="text-blue-400">{serverIP}</span>
            </div>
            <button 
              onClick={handleCopy} 
              className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-all ${copied ? "bg-green-500 hover:bg-green-600" : ""}`}
            >
              {copied ? "Copied!" : "Copy IP"}
            </button>
          </div>
          <a href="https://tntrun.de" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg mt-10 inline-block">
            Play Now
          </a>
        </div>
      </section>
    </>
  );
}
