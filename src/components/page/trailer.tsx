import React from "react";
import { Button } from "@/components/ui/button";

export default function Trailer() {
  return (
    <section className="bg-gray-950">
      <div className="container mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-4">TRAILER</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1">
            <iframe
              src="https://www.youtube.com/embed/0RvoFmAmrg4"
              title="OnThePixel.net Trailer"
              frameBorder="0"
              style={{
                aspectRatio: "500/300",
                objectFit: "cover",
              }}
              width="500"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-auto"></iframe>
          </div>
          <div className="col-span-1 text-sm">
            <p>
              Ad pellentesque parturient euismod vestibulum porta porttitor
              vehicula sed tempor orci. Justo mauris cras faucibus iaculis mus
              lorem aliquam consectetur ridiculus urna. Rhoncus ante nulla
              maecenas blandit magna sapien sapien habitant hac pharetra. Montes
              rhoncus conubia senectus hendrerit class blandit sociis diam
              nascetur habitant. Id tempor luctus ligula mollis sapien urna
              consequat eu pharetra metus. Feugiat lobortis netus penatibus
              porta nisi euismod lacinia at torquent suscipit. Eleifend sagittis
              in ullamcorper mauris ullamcorper ornare magna imperdiet cum
              convallis. Primis blandit accumsan facilisi ligula facilisi
              pharetra porttitor conubia mollis natoque. Nec fringilla porttitor
              ornare erat convallis laoreet suscipit metus aliquet per. Euismod
              habitant justo euismod hac integer lectus turpis lacus vivamus
              risus.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
