import React from "react";

export default function Trailer() {
  return (
    <section className="bg-gray-950">
      <div className="mx-auto px-4 py-10 max-w-screen-xl">
        <h1 className="text-2xl font-bold mb-4 text-center">TRAILER</h1>
        <iframe
          src="https://www.youtube.com/embed/0RvoFmAmrg4?controls=0&rel=0"
          title="OnThePixel.net Trailer"
          frameBorder="0"
          style={{
            aspectRatio: "16/9",
            objectFit: "cover",
          }}
          className="w-full aspect-w-16 aspect-h-9 mx-auto"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen></iframe>
      </div>
    </section>
  );
}
