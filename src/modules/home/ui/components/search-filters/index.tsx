"use client";

import { useTRPC } from "@/trpc/client";
// import { CustomCategory } from "../types";
import { Categories } from "./categories";
import { SearchInput } from "./search-input";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { DEFAULT_BG_COLOR } from "../../../constants";
import { BreadcrumbNavigation } from "./breadcrumbs-navigation";
import { useProductFilters } from "@/modules/products/hooks/use-product-filters";

// interface Props {
//   data: CustomCategory[];
// }

export const SearchFilters = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.categories.getMany.queryOptions());
  const [filters, setFilters] = useProductFilters(); // use it for search params

  const params = useParams();

  const categoryParam = params.category as string | undefined;
  const activeCategory = categoryParam || "all";
  const activeCategoryData = data.find(
    (category) => category.slug === activeCategory
  );

  // we need both name and color:
  const activeCategoryColor = activeCategoryData?.color || DEFAULT_BG_COLOR;
  const activeCategoryName = activeCategoryData?.name || null;

  // we only need name:
  const activeSubcategory = params.subcategory as string | undefined;
  const activeSubcategoryName =
    activeCategoryData?.subcategories.find(
      (subcategory) => subcategory.slug === activeSubcategory
    )?.name || null;

  return (
    <div
      className="px-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full"
      style={{ backgroundColor: activeCategoryColor }}
    >
      {/* Pass data to Search Input for showing the categoriesSidebar  */}
      <SearchInput
        defaultValue={filters.search}
        onChange={(value) => setFilters({ search: value })}
      />
      {/* Hide Categories on Mobile */}
      <div className="hidden lg:block">
        <Categories data={data} />
      </div>
      <BreadcrumbNavigation
        activeCategoryName={activeCategoryName}
        activeCategory={activeCategory}
        activeSubcategoryName={activeSubcategoryName}
      />

      {/* {JSON.stringify(data, null, 2)} */}
    </div>
  );
};

export const SearchFiltersSkeleton = () => {
  return (
    <div
      className="px-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full"
      style={{ backgroundColor: "#F5F5F5" }}
    >
      <SearchInput disabled={true} />
      <div className="hidden lg:block">
        <div className="h-11"></div>
      </div>
    </div>
  );
};
