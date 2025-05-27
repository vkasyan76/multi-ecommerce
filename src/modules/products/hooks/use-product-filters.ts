import {
  parseAsString,
  parseAsArrayOf,
  useQueryStates,
  parseAsStringLiteral,
} from "nuqs";
// inport above from "nuqs"
// import { parseAsString, parseAsArrayOf } from "nuqs/server";

const sortValues = ["curated", "trending", "hot_and_new"] as const;

export const params = {
  sort: parseAsStringLiteral(sortValues).withDefault("curated"),
  minPrice: parseAsString.withOptions({ clearOnDefault: true }).withDefault(""),
  maxPrice: parseAsString.withOptions({ clearOnDefault: true }).withDefault(""),
  tags: parseAsArrayOf(parseAsString)
    .withOptions({ clearOnDefault: true })
    .withDefault([]),
};

export const useProductFilters = () => {
  return useQueryStates(params);
};

// mved to src/modules/products/hooks/searchParams.tsx:
// export const loadProductFilters = createLoader(params);
