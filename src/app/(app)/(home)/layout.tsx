// import configPromise from "@payload-config";
// import { getPayload } from "payload";

import { Suspense } from "react";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { Footer } from "./footer";
import { Navbar } from "./navbar";
import { SearchFilters, SearchFiltersSkeleton } from "./search-filters";
// import { Category } from "../../../../payload-types";
// import { CustomCategory } from "./types";

interface Props {
  children: React.ReactNode;
}

const Layout = async ({ children }: Props) => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.categories.getMany.queryOptions());

  // const payload = await getPayload({
  //   config: configPromise,
  // });

  // const data = await payload.find({
  //   collection: "categories",
  //   depth: 1, // populate subcategories, subcategories.[0] will be a type of "Category"
  //   pagination: false,
  //   where: {
  //     parent: {
  //       exists: false,
  //     },
  //   },
  //   sort: "name",
  // });

  // const formattedData: CustomCategory[] = data.docs.map((doc) => ({
  //   ...doc,
  //   subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
  //     // Because of "depth: 1" we are confident doc will be a type of category
  //     ...(doc as Category),
  //     subcategories: undefined,
  //   })),
  // }));

  // console.log({data, formattedData});

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<SearchFiltersSkeleton />}>
          {/* <SearchFilters data={formattedData} /> */}
          {/* <SearchFilters data={[]} /> */}
          {/* <SearchFilters data={[]} /> */}
          <SearchFilters />
        </Suspense>
      </HydrationBoundary>

      <div className="flex-1 bg-[#F4F4F0]"> {children}</div>
      <Footer />
    </div>
  );
};

export default Layout;
