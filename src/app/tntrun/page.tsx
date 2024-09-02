import React from "react";
import TopPage from "@/components/page/top";

export default function TNTRun() {
  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-4xl font-bold mb-5 text-center">TNT Run</h1>
          <h2 className="text-2xl font-semibold mb-4 text-center">Welcome to tntrun.de</h2>
          
          <div className="text-gray-300 max-w-4xl mx-auto text-center">
            <p className="mb-8">
              TNT Run is an exciting Minecraft Java Edition minigame where players run on blocks that disappear shortly after stepping on them. Your goal is to survive as long as possible while the ground falls away beneath you. Can you be the last one standing?
            </p>
            <p className="mb-8">
              Join our vibrant community on tntrun.de and challenge players from around the world on a variety of unique maps. Whether you're a seasoned TNT Run veteran or a newcomer, there's always a new challenge waiting for you!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-2xl font-semibold mb-2">Fast-Paced Action</h3>
              <p className="text-gray-400">Experience thrilling gameplay that requires quick reflexes.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-2xl font-semibold mb-2">Diverse Maps</h3>
              <p className="text-gray-400">Play on a variety of maps with unique designs.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-2xl font-semibold mb-2">Community & Rankings</h3>
              <p className="text-gray-400">Compete against others and climb the leaderboards.</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <h2 className="text-3xl font-semibold mb-4">Join Now!</h2>
            <p className="text-gray-300 max-w-xl mx-auto mb-6">
              Become part of the TNT Run community and test your skills. Visit our website <a href="https://tntrun.de" className="text-blue-400 underline">tntrun.de</a> and start playing today!
            </p>
            <p className="text-gray-400 text-lg font-semibold">
              Server IP: <span className="text-white">play.tntrun.de</span>
            </p>
            <p className="text-gray-400">Launch Minecraft and paste the IP to join!</p>
          </div>
        </div>
      </section>
    </>
  );
}
