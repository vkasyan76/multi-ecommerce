import { Button } from "@/components/ui/button";
import { cn, generateTenantUrl } from "@/lib/utils";

import { useCart } from "../../hooks/use-cart";
import Link from "next/link";
import { ShoppingCartIcon } from "lucide-react";

interface CheckoutButtonProps {
  className?: string;
  hideIfEmpty?: boolean;
  tenantSlug: string;
}

export const CheckoutButton = ({
  className,
  hideIfEmpty,
  tenantSlug,
}: CheckoutButtonProps) => {
  // productIds.length
  const { totalItems } = useCart(tenantSlug);

  if (hideIfEmpty && totalItems === 0) {
    return null;
  }

  return (
    <Button variant="elevated" className={cn("bg-white", className)} asChild>
      <Link href={`${generateTenantUrl(tenantSlug)}/checkout`}>
        <ShoppingCartIcon /> {totalItems > 0 ? totalItems : ""}
      </Link>
    </Button>
  );
};
