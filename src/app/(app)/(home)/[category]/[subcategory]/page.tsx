import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";
import { ProductListView } from "@/modules/products/ui/components/views/product-list-view";
import { SearchParams } from "nuqs/server";
import { loadProductFilters } from "@/modules/products/hooks/search-params";

interface Props {
  // Next.js asynchronously provides params
  params: Promise<{ subcategory: string }>;
  searchParams: Promise<SearchParams>;
}

const Page = async ({ params, searchParams }: Props) => {
  const { subcategory } = await params;

  const filters = await loadProductFilters(searchParams);
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.products.getMany.queryOptions({ category: subcategory, ...filters })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductListView category={subcategory} />
    </HydrationBoundary>
  );
};

export default Page;

// page before productlist view:

// import {
//   ProductList,
//   ProductListSkeleton,
// } from "@/modules/products/ui/components/products-list";
// import { Suspense } from "react";

// interface Props {
//   // Next.js asynchronously provides params
//   params: Promise<{ subcategory: string }>;
// }

// const Page = async ({ params }: Props) => {
//   const { subcategory } = await params;

//   // const products = await caller.products.getMany();
//   const queryClient = getQueryClient();
//   void queryClient.prefetchQuery(
//     trpc.products.getMany.queryOptions({ category: subcategory })
//   );

//   return (
//     <HydrationBoundary state={dehydrate(queryClient)}>
//       <Suspense fallback={<ProductListSkeleton />}>
//         <ProductList category={subcategory} />
//       </Suspense>
//     </HydrationBoundary>
//   );
// };

// export default Page;

// initial page

// interface Props {
//   // Next.js asynchronously provides params
//   params: Promise<{ category: string; subcategory: string }>;
// }

// const Page = async ({ params }: Props) => {
//   const { category, subcategory } = await params;

//   return (
//     <div>
//       Category: {category} <br />
//       Subcategory: {subcategory}
//     </div>
//   );
// };

// export default Page;
