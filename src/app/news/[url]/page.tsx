import TopPage from "@/components/page/top";

export default function Page() {
  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">NEWS</h1>
          <p className="mb-8 text-gray-300 text-lg leading-relaxed">
            Welcome to the OnThePixel.net news center! Here you'll discover the latest updates, exciting new features, 
            and important announcements from our vibrant Minecraft community. From game mode releases and server improvements 
            to special events and community highlights, we keep you informed about everything happening in our pixelated world. 
            Whether you're interested in new minigames, balance changes, or upcoming tournaments, this is your go-to source 
            for all OnThePixel.net developments. Join thousands of players who stay connected with our ever-evolving server 
            and never miss out on the action that makes our community special.
          </p>
        </div>
      </section>
    </>
  );
}
