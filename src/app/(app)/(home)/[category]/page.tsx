// import { caller } from "@/trpc/server";
import {
  ProductList,
  ProductListSkeleton,
} from "@/modules/products/ui/components/products-list";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient, trpc } from "@/trpc/server";
import { Suspense } from "react";

interface Props {
  // Next.js asynchronously provides params
  params: Promise<{ category: string }>;
}

const Page = async ({ params }: Props) => {
  const { category } = await params;

  // const products = await caller.products.getMany();
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.products.getMany.queryOptions({ category })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProductListSkeleton />}>
        <ProductList category={category} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;

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
