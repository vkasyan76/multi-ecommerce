import { ChangeEvent, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  minPrice?: string | null;
  maxPrice?: string | null;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
}

// Helper functions:
const getLocale = (): string => {
  if (typeof window !== "undefined" && navigator?.language) {
    return navigator.language;
  }
  return "en-US";
};

const getDecimalSeparator = (locale: string): string =>
  (1.1).toLocaleString(locale).substring(1, 2);

export const formatAsCurrency = (
  value: string,
  locale = getLocale(),
  currency = "USD"
) => {
  // Determine the decimal separator for the current localce

  const decimalSeparator = getDecimalSeparator(locale);

  // Determine the thousands separator by formatting a bigger number
  const thousandSeparator = (1000).toLocaleString(locale).replace(/1|0/g, "");

  // Remove thousands separators from input
  let normalizedValue = value.split(thousandSeparator).join("");

  // Replace locale decimal separator with '.' for parsing
  if (decimalSeparator !== ".") {
    normalizedValue = normalizedValue.replace(decimalSeparator, ".");
  }

  // Remove all chars except digits and dot
  normalizedValue = normalizedValue.replace(/[^0-9.]/g, "");

  // Split on dot to limit decimals to 2 digits max
  const parts = normalizedValue.split(".");
  const formattedValue =
    parts[0] + (parts.length > 1 ? "." + parts[1]?.slice(0, 2) : "");

  if (!formattedValue) return "";

  const numberValue = parseFloat(formattedValue);
  if (isNaN(numberValue)) return "";

  // Format number as currency in user locale
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numberValue);
};

export const PriceFilter = ({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
}: Props) => {
  const locale = useMemo(() => getLocale(), []);
  // Determine the decimal separator for the current locale

  const priceRegex = useMemo(() => /[^0-9.,]/g, []);

  const normalizePriceInput = (input: string): string => {
    let numericValue = input.replace(priceRegex, "");

    // Replace all commas with dots (so 405,50 becomes 405.50)
    numericValue = numericValue.replace(/,/g, ".");

    return numericValue;
  };

  const handleMinPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = normalizePriceInput(e.target.value);
    onMinPriceChange(cleanedValue);
  };

  const handleMaxPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = normalizePriceInput(e.target.value);
    onMaxPriceChange(cleanedValue);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <Label className="font-medium text-base">Minimum price</Label>
        <Input
          type="text"
          placeholder="$0"
          value={minPrice ? formatAsCurrency(minPrice, locale) : ""}
          onChange={handleMinPriceChange}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="font-medium text-base">Maximum price</Label>
        <Input
          type="text"
          placeholder="∞" // Infinity sign
          value={maxPrice ? formatAsCurrency(maxPrice, locale) : ""}
          onChange={handleMaxPriceChange}
        />
      </div>
    </div>
  );
};
