import React from "react";
import TopPage from "@/components/page/top";

export default function TNTRun() {
  return (
    <>
      
      <section className="bg-gray-950 pt-36 pb-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6 text-white">TNT Run</h1>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Welcome to TNT Run! Your challenge: escape the falling TNT blocks and stay on the highest platform for as long as possible. Whether you're a seasoned pro or a newbie, there's always a thrill waiting for you.
          </p>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Dive into the excitement with PvP combat and Double Jumps to enhance your gameplay. Win and earn "Pixels," our server's currency, to unlock new features and rewards!
          </p>
          <a 
            href="https://tntrun.de" 
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out"
          >
            Play Now
          </a>
        </div>
      </section>
    </>
  );
}
