import React from "react";

export default function Trailer() {
  return (
    <section className="py-10 px-4 bg-gray-950">
      <div className="container mx-auto px-4 py-10">
        <h1 id="changelog" className="text-3xl font-bold mb-4">
          TRAILER
        </h1>
        <div className="m-auto">
          <iframe
            src="https://www.youtube-nocookie.com/embed/0RvoFmAmrg4?controls=1&rel=0"
            title="OnThePixel.net Trailer"
            frameBorder="0"
            style={{
              aspectRatio: "16/9",
              objectFit: "cover",
            }}
            className="w-full aspect-w-16 aspect-h-9 mx-auto"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </section>
  );
}
