import Image from "next/image";

export default function Loader() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Image
        src="/images/MuLoader.gif"
        alt="Loader"
        height={400}
        width={400}
        unoptimized
        priority
      />
    </div>
  );
}
