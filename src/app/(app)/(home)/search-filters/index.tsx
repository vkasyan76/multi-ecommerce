// src/app/(app)/(home)/search-filters/index.tsx

import { SearchInput } from "./search-input";

interface Props {
  data: any; // ⚠️ Temporary "any" type (will fix later)
}

export const SearchFilters = ({ data }: Props) => {
  return (
    <div className="px-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full">
      <SearchInput disabled={false} />
      {JSON.stringify(data, null, 2)}
    </div>
  );
};
