import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="bg-[url('/bg.png')] bg-cover h-[100vh] flex flex-col items-center justify-center">
        <Image
          src={"/logo.png"}
          alt="logo"
          width={200}
          height={200}
          className="mb-20"
        />
        <h1 className="text-5xl mb-96 text-white font-bold [text-shadow:_0_0_5px_rgb(0_0_0_/_50%)]">
          OnThePixel.net
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
