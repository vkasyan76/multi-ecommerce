import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { ProductList } from "../components/products-list";
import { Suspense } from "react";
import { ProductCardSkeleton } from "../components/product-card";

export const LibraryView = () => {
  return (
    <div className="min-h-screen bg-white">
      <nav className="p-4 bg-[#F4F4F0] w-full border-b">
        <Link prefetch href="/" className="flex items-center gap-2">
          <ArrowLeftIcon className="size-4" />
          <span className="text font-medium">Continue shoping</span>
        </Link>
      </nav>
      <header className="bg-[#F4F4F0] py-8 border-b">
        <div className="max-w-(--breakpoint-xl) mx-auto px-4 lg:px-12 flex flex-col gap-y-4">
          <h1 className="text-[40px] font-medium">Library</h1>
          <p className="font-medium">Your purchases and reviews</p>
        </div>
      </header>
      <section className="max-w-(--breakpoint-xl) mx-auto px-4 lg:px-12 py-10">
        <div className="lg:col-span-4 xl:col-span-6">
          <Suspense fallback={<ProductCardSkeleton />}>
            <ProductList />
          </Suspense>
        </div>
      </section>
    </div>
  );
};
