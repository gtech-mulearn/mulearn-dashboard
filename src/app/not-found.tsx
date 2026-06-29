import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cdnUrl } from "@/lib/cdn";

export default function NotFound() {
  const stone = cdnUrl("src/components/assests/NotFound/Stone.webp");
  const ufo = cdnUrl("src/components/assests/NotFound/UFO.webp");
  const smallRocks = cdnUrl("src/components/assests/NotFound/SmallRocks.webp");
  const marsSurface = cdnUrl(
    "src/components/assests/NotFound/NoBgFourNotFour.webp",
  );
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="absolute flex flex-col items-center left-6 top-12 sm:left-10 sm:top-16 md:left-20 md:top-20">
        <div className="flex flex-row items-center gap-1 text-lg font-medium sm:text-2xl md:text-4xl">
          <div className="rotate-[6deg] animate-uh">uh,</div>
          <div className="relative top-1 rotate-[7deg] animate-oh">Oh!</div>
          <span className="flex flex-row relative top-1 -rotate-[12deg] animate-span">
            <div>you</div>
            <div className="rotate-[12deg]">&apos;ve</div>
          </span>
        </div>
        <div className="flex flex-row items-center gap-1 font-bold -mt-4 text-5xl sm:text-6xl md:text-8xl">
          <div className="animate-l">l</div>
          <Image
            src={stone}
            alt="stone"
            width={80}
            height={80}
            className="relative top-1 h-10 w-auto sm:h-14 md:h-20 animate-o"
          />
          <div className="animate-s">s</div>
          <div className="animate-t">t</div>
        </div>
        <div className="flex flex-row items-center gap-1 font-semibold -mt-6 text-2xl sm:text-3xl md:text-5xl">
          <div className="rotate-[3deg] animate-float-in">in</div>
          <div className="-rotate-[2deg] animate-space">space</div>
        </div>
      </div>
      <Image
        src={ufo}
        alt="UFO"
        width={400}
        height={200}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2] animate-ufo-float 
                   w-40 sm:w-60 md:w-80"
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-[1]">
        <div className="flex flex-col items-center gap-2 select-none">
          <h1 className="text-[8rem] sm:text-[11rem] md:text-[14rem] font-black leading-none tracking-tighter drop-shadow-[0_4px_32px_rgba(0,0,0,0.6)]">
            404
          </h1>
          <div className="flex flex-col items-center gap-2 text-center max-w-md">
            <h2 className="text-xl sm:text-2xl font-semibold">
              Page not found
            </h2>
            <span className="text-sm sm:text-base">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
            </span>
          </div>
        </div>
        <Link href="/dashboard">
          <Button className="mt-6 px-6 py-3 font-semibold">Go Home</Button>
        </Link>
      </div>
      <Image
        src={smallRocks}
        alt="Small Rocks"
        width={1920}
        height={600}
        className="absolute w-full bottom-20 z-0 animate-rocks"
      />
      <Image
        src={marsSurface}
        alt="Mars Surface"
        width={1920}
        height={240}
        className="absolute w-full h-40 sm:h-48 md:h-60 object-cover bottom-0 z-0"
      />
    </div>
  );
}
