import type { SearchParams } from "nuqs/server";
import { loadProductFilters } from "@/modules/products/hooks/search-params";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";
import { ProductListView } from "@/modules/products/ui/components/views/product-list-view";
import { DEFAULT_LIMIT } from "@/constants";
interface Props {
  // Next.js asynchronously provides params
  params: Promise<{ category: string }>;
  searchParams: Promise<SearchParams>;
}

const Page = async ({ params, searchParams }: Props) => {
  const { category } = await params;

  const filters = await loadProductFilters(searchParams);

  // console.log(JSON.stringify(filters, null, 2), "THIS IS FROM RCS");

  // const products = await caller.products.getMany();
  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(
    trpc.products.getMany.infiniteQueryOptions({
      category,
      ...filters,
      limit: DEFAULT_LIMIT,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductListView category={category} />
    </HydrationBoundary>
  );
};

export default Page;

// This was before we moved to the new ProductListView component:

// import {
//   ProductList,
//   ProductListSkeleton,
// } from "@/modules/products/ui/components/products-list";
// import { Suspense } from "react";
// import { ProductFilters } from "@/modules/products/ui/components/product-filters";
// import { ProductSort } from "@/modules/products/ui/components/product-sort";

// <div className="px-4 lg:px-12 py-8 flex flex-col gap-4">
//     <div className="flex flex-col lg:flex-row lg:items-center gap-y-2 lg:gap-y-0 justify-between">
//       <p className="text-2xl font-medium">Curated for you</p>
//       <ProductSort />
//     </div>

//     <div className="grid grid-cols-1 lg:grid-cols-6 xl:grid-cols-8 gap-y-6 gap-x-12">
//       <div className="lg:col-span-2 xl:col-span-2">
//         {/* <div className="border p-2">Product Filters</div> */}
//         <ProductFilters />
//       </div>
//       <div className="lg:col-span-4 xl:col-span-6">
//         <Suspense fallback={<ProductListSkeleton />}>
//           <ProductList category={category} />
//         </Suspense>
//       </div>
//     </div>
//   </div>

// Products as a server component:

// import { caller } from "@/trpc/server";

// interface Props {
//   // Next.js asynchronously provides params
//   params: Promise<{ category: string }>;
// }

// const Page = async ({ params }: Props) => {
//   const { category } = await params;

//   const products = await caller.products.getMany();

//   return (
//     <div>
//       Category: {category}
//       <br />
//       Products: {JSON.stringify(products)}
//     </div>
//   );
// };

// export default Page;
