import React from "react";
import Image from "next/image";

/**
 * Renders the homepage layout.
 * @returns The rendered homepage layout.
 */
export default function Home() {
  return (
    <>
      <div
        className="bg-[url('/bg.png')] bg-cover h-[100vh] flex flex-col items-center justify-center"
        style={{ backgroundImage: "url('/bg.png')" }}>
        <Image
          src={"/logo.png"}
          alt="logo"
          width={200}
          height={200}
          className="mb-20"
        />
        <h1 className="text-center text-5xl font-bold tracking-tight text-white mb-80">
          <div className="inline-grid">
            <span className="col-start-1 row-start-1 bg-clip-text text-5xl font-bold tracking-tight text-transparent text-white">
              OnThePixel.net
            </span>
            <span
              aria-hidden="true"
              className="bg-gradient col-start-1 row-start-1 overflow-visible text-5xl font-bold tracking-tight opacity-100 blur-lg">
              OnThePixel.net
            </span>
          </div>
        </h1>
      </div>

      <section className="prose">
        <h1>Tiny ist tiny und hat einen tiny Tiny</h1>
        <p>
          Vero omnis perspiciatis ex vel voluptatem blanditiis quae ullam, ipsa,
          necessitatibus dolores explicabo architecto, deserunt asperiores. Quia
          assumenda facere amet nesciunt culpa nisi temporibus dicta
          reprehenderit. Veritatis accusamus modi sint.
        </p>
        <p>
          Excepturi dolores quidem perferendis quas unde doloremque explicabo
          debitis delectus, mollitia fugiat? Sunt nam nihil perspiciatis eum
          incidunt? Unde iure hic deleniti possimus sunt earum fugiat commodi
          tempora illum omnis?
        </p>
        <p>
          Placeat qui excepturi corporis voluptatum. In nihil tempora veritatis
          magnam natus id at optio quaerat. Perspiciatis vero repellendus vel
          quo culpa placeat dicta odit ab, veniam accusamus, maxime ex atque?
        </p>
        <p>
          Modi, nam. Atque, neque! Amet at totam excepturi vitae quibusdam.
          Commodi distinctio odit cum aut inventore iure quaerat optio
          exercitationem eos tempore dolores similique, iste mollitia, culpa
          officiis nostrum voluptatum.
        </p>
      </section>
    </>
  );
}
