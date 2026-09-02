import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

/**
 * The branded 404 screen, as markup only.
 *
 * There are two 404 entry points and they cannot share a component instance:
 * `app/[locale]/not-found.tsx` runs inside the layout and knows the locale,
 * while `app/not-found.tsx` answers URLs that never matched a locale segment
 * at all and therefore has no layout around it. Keeping the markup here means
 * the two stay identical instead of drifting apart.
 */
export default function NotFoundScreen({
  tagline,
  homeLabel,
  homeHref,
}: {
  tagline: string;
  homeLabel: string;
  /** Already localized — this component does no path handling itself. */
  homeHref: string;
}) {
  return (
    <div
      key="1"
      className="relative min-h-screen flex flex-col items-center justify-center text-white"
    >
      <div className="absolute inset-0 -z-10">
        <Image
          alt=""
          className="object-cover w-full h-full filter brightness-75"
          height="1080"
          sizes="100vw"
          src="/bc993216-3548-4e87-bb85-bfb349c3d3b3"
          style={{
            aspectRatio: "1920/1080",
            objectFit: "cover",
          }}
          width="1920"
        />
        <div className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-950" />
      </div>
      <main className="flex flex-col items-center">
        <div className="relative mb-4">
          <Image
            alt="OnThePixel.net"
            height="100"
            sizes="250px"
            src="/bf6cf0de-bf69-44d1-b107-6ad846ab7c9e"
            style={{
              aspectRatio: "100/100",
              objectFit: "cover",
            }}
            width="250"
          />
        </div>
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
          style={{
            color: "#fff",
            textShadow: "0 0 15px #fff",
          }}
        >
          404
        </h1>
        <p className="mb-8 text-center">
          {tagline}
        </p>
        <div className="flex space-x-4">
          <Link href={homeHref}>
            <Button className="bg-green-700 text-white text-lg sm:text-xl md:text-2xl px-4 sm:px-6 py-2 flex items-center w-36 sm:w-40 md:w-48 h-12 hover:scale-105 transition-transform duration-500">
              {homeLabel}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
