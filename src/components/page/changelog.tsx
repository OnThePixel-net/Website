import React from "react";

export default function ChangeLog() {
  return (
    <section className="py-10 px-4 bg-gray-950">
      <div className="container mx-auto px-4 py-10">
        <h2 id="team" className="text-3xl font-bold mb-4">
          CHANGELOG
        </h2>
        {/*  */}
        <div className="bg-[#1e1e1e] p-4 my-4 border-l-4 border-green-500">
          <h3
            className="text-lg font-bold text-green-500"
            style={{
              color: "#00de6d",
              textShadow: "0 0 10px #00de6d",
            }}>
            Closed beta coming soon!
          </h3>
          <span className="text-xs text-gray-400">01/12/2023</span>
          <p className="text-sm mt-2">
            We are proud to announce that the server is already in its final
            phases. Unfortunately, some functions as well as those of your own
            will require the time of the most patient of you, this means that we
            are starting recruitment for the Closed Beta, which will start
            around December 27. Thank you for being with us{" "}
          </p>
        </div>
        {/*  */}
        <div className="bg-[#1e1e1e] p-4 my-4 border-l-4 border-green-500">
          <h3
            className="text-lg font-bold text-green-500"
            style={{
              color: "#00de6d",
              textShadow: "0 0 10px #00de6d",
            }}>
            Closed beta coming soon!
          </h3>
          <span className="text-xs text-gray-400">01/12/2023</span>
          <p className="text-sm mt-2">
            We are proud to announce that the server is already in its final
            phases. Unfortunately, some functions as well as those of your own
            will require the time of the most patient of you, this means that we
            are starting recruitment for the Closed Beta, which will start
            around December 27. Thank you for being with us{" "}
          </p>
        </div>
      </div>
    </section>
  );
}
