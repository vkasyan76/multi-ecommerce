// src/app/(app)/(home)/search-filters/index.tsx

import { CustomCategory } from "../types";
import { Categories } from "./categories";
import { SearchInput } from "./search-input";

interface Props {
  data: CustomCategory[];
}

export const SearchFilters = ({ data }: Props) => {
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
