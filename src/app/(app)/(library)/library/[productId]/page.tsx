import { ProductView } from "@/modules/library/ui/views/product-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

interface Props {
  params: Promise<{
    productId: string;
  }>;
}

const Page = async ({ params }: Props) => {
  const { productId } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.library.getOne.queryOptions({ productId })
  );

  void queryClient.prefetchQuery(
    trpc.reviews.getOne.queryOptions({ productId })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductView productId={productId} />
    </HydrationBoundary>
  );
};

export default Page;

// Even with void, the fetch is triggered as soon as the function runs.
// If your data loads quickly (e.g., local dev, fast DB, simple queries), it will usually finish before React proceeds to render and dehydrate the cache.
// Always await (or Promise.all) your prefetches before you dehydrate in a server component. The tutorial’s void approach is not safe and can cause subtle bugs.
// await Promise.all([
//   queryClient.prefetchQuery(trpc.library.getOne.queryOptions({ productId })),
//   queryClient.prefetchQuery(trpc.reviews.getOne.queryOptions({ productId })),
// ]);

// Or, if only one:
// await queryClient.prefetchQuery(
//   trpc.library.getOne.queryOptions({ productId })
// );
