import React from "react";
import { changelogs } from "./changelog.ts";

export default function ChangeLog() {
  return (
    <section className="py-10 px-4 bg-gray-950">
      <div className="container mx-auto px-4 py-10">
        <h1 id="changelog" className="text-3xl font-bold mb-4 text-white">
          CHANGELOG
        </h1>
        {changelogs.map((entry, index) => (
          <div
            key={index}
            className="bg-white/10 p-4 my-4 border-l-4 border-green-500 rounded-lg"
          >
            <h3
              className="text-lg font-bold text-green-500" 
              style={{ color: "#00de6d", textShadow: "0 0 10px #00de6d" }}
            >
              {entry.title}
            </h3>
            <span className="text-xs text-gray-400">{entry.date}</span>
            <div className="text-sm mt-2">
              <p className="text-gray-300">{entry.content}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}