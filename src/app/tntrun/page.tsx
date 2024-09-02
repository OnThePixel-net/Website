import React, { useState } from "react";
import TopPage from "@/components/page/top";

export default function TNTRun() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText("play.tntrun.de");
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36 pb-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6 text-white">TNT Run</h1>
          <p className="text-gray-300 text-lg mb-8 max-w-3xl mx-auto">
            In TNT Run, your goal is to avoid falling down and stay on the platforms for as long as possible. Whether you&apos;re a beginner or a pro, there&apos;s something for everyone!
          </p>
          <p className="text-gray-300 text-lg mb-8 max-w-3xl mx-auto">
            Our TNT Run features exciting PvP opportunities and the chance to use Double Jumps to save yourself from falling. Win the game and earn our server currency, Pixels, to enhance your experience!
          </p>
          <div className="flex justify-center items-center mb-8">
            <span className="text-gray-300 text-lg">IP: play.tntrun.de</span>
            <button
              onClick={copyToClipboard}
              className="ml-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
            >
              {copied ? "Copied!" : "Copy IP"}
            </button>
          </div>
          <a
            href="https://tntrun.de"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg"
          >
            Play Now
          </a>
        </div>
      </section>
    </>
  );
}
