"use client";

import { useTRPC } from "@/trpc/client";
// import { CustomCategory } from "../types";
import { Categories } from "./categories";
import { SearchInput } from "./search-input";
import { useSuspenseQuery } from "@tanstack/react-query";

// interface Props {
//   data: CustomCategory[];
// }

export const SearchFilters = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.categories.getMany.queryOptions());

  return (
    <div className="px-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full">
      {/* Pass data to Search Input for showing the categoriesSidebar  */}
      <SearchInput data={data} />
      {/* Hide Categories on Mobile */}
      <div className="hidden lg:block">
        <Categories data={data} />
      </div>

      {/* {JSON.stringify(data, null, 2)} */}
    </div>
  );
};
