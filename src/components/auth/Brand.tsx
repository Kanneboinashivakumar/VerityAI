import Image from "next/image";
import Link from "next/link";

export function Brand({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="Verity AI home" className={`inline-flex items-center ${className}`}>
      <Image
        src="/logo-black.png"
        alt="Verity AI"
        width={130}
        height={35}
        priority
        className="w-[124px] h-auto object-contain"
      />
    </Link>
  );
}
