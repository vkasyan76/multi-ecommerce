import Link from "next/link";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

export const Footer = () => {
  return (
    <footer className="border-t font-medium bg-white">
      <div className="max-w-(--breakpoint-xl) mx-auto flex items-center h-full gap-2 px-4 py-6 lg:px-12">
        <p>Powered by</p>
        <Link href="/">
          <span className={cn("text-2xls font-semibold", poppins.className)}>
            funroad
          </span>
        </Link>
      </div>
    </footer>
  );
};
