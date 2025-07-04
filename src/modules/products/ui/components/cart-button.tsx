import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/modules/checkout/hooks/use-cart";
import Link from "next/link";

interface Props {
  tenantSlug: string;
  productId: string;
  isPurchased?: boolean; // Optional prop to indicate if the product is already purchased
}

export const CartButton = ({ tenantSlug, productId, isPurchased }: Props) => {
  const cart = useCart(tenantSlug);

  if (isPurchased) {
    return (
      <Button
        variant="elevated"
        asChild
        className="flex-1 font-medium bg-white"
      >
        {/* <Link prefetch href={`/library/${productId}`}> */}
        {/* to ensure domain redirect in production */}
        <Link
          prefetch
          href={`${process.env.NEXT_PUBLIC_APP_URL}/library/${productId}`}
        >
          View in Library
        </Link>
      </Button>
    );
  }

  return (
    <Button
      variant="elevated"
      //   className="flex-1 bg-pink-400"
      className={cn(
        "flex-1 bg-pink-400",
        cart.isProductInCart(productId) && "bg-white"
      )}
      onClick={() => cart.toggleProduct(productId)}
    >
      {cart.isProductInCart(productId) ? "Remove from cart" : "Add to cart"}
    </Button>
  );
};
