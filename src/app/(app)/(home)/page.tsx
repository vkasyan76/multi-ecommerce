import type { SearchParams } from "nuqs/server";
import { loadProductFilters } from "@/modules/products/hooks/search-params";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";
import { ProductListView } from "@/modules/products/ui/components/views/product-list-view";
import { DEFAULT_LIMIT } from "@/constants";
interface Props {
  // Next.js asynchronously provides params
  // params: Promise<{ category: string }>;
  searchParams: Promise<SearchParams>;
}

const Page = async ({ searchParams }: Props) => {
  // const { category } = await params;

  const filters = await loadProductFilters(searchParams);

  // console.log(JSON.stringify(filters, null, 2), "THIS IS FROM RCS");

  // const products = await caller.products.getMany();
  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(
    trpc.products.getMany.infiniteQueryOptions({
      // category,
      ...filters,
      limit: DEFAULT_LIMIT,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductListView />
    </HydrationBoundary>
  );
};

export default Page;

// Feetching Auth before chapter 15:

// import { useTRPC } from "@/trpc/client";
// // import { useSuspenseQuery } from "@tanstack/react-query";
// import { useQuery } from "@tanstack/react-query";

// export default function Home() {
//   const trpc = useTRPC();

//   const { data } = useQuery(trpc.auth.session.queryOptions());

//   return <div>{JSON.stringify(data?.user, null, 2)}</div>;
// }

// Fetching with useSusspense component:  //  Fetching in trpc client component (non async):

// import { useTRPC } from "@/trpc/client";
// import { useSuspenseQuery } from "@tanstack/react-query";

// export default function Home() {
//   const trpc = useTRPC();
//   // const categories = useQuery(trpc.categories.getMany.queryOptions());
//   // to avoid hydration error, caused by mismatch of loading state b/w server and client:
//   const { data: categories } = useSuspenseQuery(
//     trpc.categories.getMany.queryOptions()
//   );

//   return (
//     <div>
//       {/* <p>is loading: {`${categories.isLoading}`}</p> */}
//       {/* you need categories.data */}
//       {JSON.stringify(categories, null, 2)}
//     </div>
//   );
// }

// Fetching in trpc server component:

// import { getQueryClient, trpc } from "@/trpc/server";

// export default async function Home() {
//   const queryClient = getQueryClient();
//   const categories = await queryClient.fetchQuery(
//     trpc.categories.getMany.queryOptions()
//   );

//   return (
//     <div>
//       {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
//       {/* Home Page */}
//       {JSON.stringify(categories, null, 2)}
//     </div>
//   );
// }

// Earlier version to twick the styling:

// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Input } from "@/components/ui/input";
// import { Progress } from "@/components/ui/progress";
// import { Textarea } from "@/components/ui/textarea";

// export default function Home() {
//   return (
//     <div className="p-4">
//       <div className="flex flex-col gap-y-4">
//         <div>
//           <Button variant="elevated">I am a button</Button>
//         </div>
//         <Input placeholder="I am an input" />
//         <div>
//           <Progress value={50} />
//         </div>
//         <div>
//           <Textarea placeholder="I am a textarea" />
//         </div>
//         <div>
//           <Checkbox />
//         </div>
//       </div>
//     </div>
//   );
// }
