import React from "react";
import Image from "next/image";

export default function Team() {
  return (
    <section className="py-10 px-4 bg-gray-950">
      <div className="container mx-auto px-4 py-10">
        <h1 id="team" className="text-3xl font-bold mb-4">
          TEAM
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/*  */}
          <div className="bg-[#1e1e1e] p-6 m-1 rounded-lg flex items-center hover:scale-105 transition-transform duration-300">
            <Image
              alt="TinyBrickBoy"
              src="https://minotar.net/helm/TinyBrickBoy"
              width={40}
              height={40}
            />
            <div className="ml-4">
              <p className="font-bold">TinyBrickBoy</p>
              <p
                className="text-sm"
                style={{
                  color: "#f1c40f",
                  textShadow: "0 0 10px #f1c40f",
                }}>
                OWNER
              </p>
            </div>
          </div>
          {/*  */}
          <div className="bg-[#1e1e1e] p-6 m-1 rounded-md flex items-center hover:scale-105 transition-transform duration-300">
            <Image
              alt="Paranoia8972"
              src="https://minotar.net/helm/Paranoia8972"
              width={40}
              height={40}
            />
            <div className="ml-4">
              <p className="font-bold">Paranoia8972</p>
              <p
                className="text-sm"
                style={{
                  color: "#f1c40f",
                  textShadow: "0 0 10px #f1c40f",
                }}>
                OWNER
              </p>
            </div>
          </div>
          {/*  */}
          {/* <div className="bg-[#1e1e1e] p-6 m-1 rounded-md flex items-center hover:scale-105 transition-transform duration-300">
            <Image
              alt="Paranoia8972"
              src="https://minotar.net/helm/Paranoia8972"
              width={40}
              height={40}
            />
            <div className="ml-4">
              <p className="font-bold">Paranoia8972</p>
              <p
                className="text-sm"
                style={{
                  color: "#5ac2de",
                  textShadow: "0 0 10px #5ac2de",
                }}>
                DEVELOPER
              </p>
            </div>
          </div> */}
          {/*  */}
          <div className="bg-[#1e1e1e] p-6 m-1 rounded-md flex items-center hover:scale-105 transition-transform duration-300">
            <Image
              alt="WichtigeEnte"
              src="https://minotar.net/helm/WichtigeEnte"
              width={40}
              height={40}
            />
            <div className="ml-4">
              <p className="font-bold">WichtigeEnte</p>
              <p
                className="text-sm"
                style={{
                  color: "#ff505e",
                  textShadow: "0 0 10px #ff505e",
                }}>
                ADMIN
              </p>
            </div>
          </div>
          {/*  */}
          {/* <div className="bg-[#1e1e1e] p-6 m-1 rounded-md flex items-center hover:scale-105 transition-transform duration-300">
            <Image
              alt="Paranoia8972"
              src="https://minotar.net/helm/Paranoia8972"
              width={40}
              height={40}
            />
            <div className="ml-4">
              <p className="font-bold">Paranoia8972</p>
              <p
                className="text-sm"
                style={{
                  color: "#a1101a",
                  textShadow: "0 0 10px #a1101a",
                }}>
                SUPPORTER
              </p>
            </div>
          </div> */}
          {/*  */}
          {/* <div className="bg-[#1e1e1e] p-6 m-1 rounded-md flex items-center hover:scale-105 transition-transform duration-300">
            <Image
              alt="Paranoia8972"
              src="https://minotar.net/helm/Paranoia8972"
              width={40}
              height={40}
            />
            <div className="ml-4">
              <p className="font-bold">Paranoia8972</p>
              <p
                className="text-sm"
                style={{
                  color: "#ff505e",
                  textShadow: "0 0 10px #ff505e",
                }}>
                ADMIN
              </p>
            </div>
          </div> */}
          {/*  */}
        </div>
      </div>
    </section>
  );
}
