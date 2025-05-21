import {
  ProductList,
  ProductListSkeleton,
} from "@/modules/products/ui/components/products-list";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient, trpc } from "@/trpc/server";
import { Suspense } from "react";

interface Props {
  // Next.js asynchronously provides params
  params: Promise<{ subcategory: string }>;
}

const Page = async ({ params }: Props) => {
  const { subcategory } = await params;

  // const products = await caller.products.getMany();
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.products.getMany.queryOptions({ category: subcategory })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProductListSkeleton />}>
        <ProductList category={subcategory} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;

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
