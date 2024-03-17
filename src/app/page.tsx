import React from "react";
import Image from "next/image";
import Header from "@/components/page/header";

/**
 * Renders the homepage layout.
 * @returns The rendered homepage layout.
 */
export default function Home() {
  return (
    <>
      <Header />
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
