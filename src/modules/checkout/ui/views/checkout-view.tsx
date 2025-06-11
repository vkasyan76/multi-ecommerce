"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { generateTenantUrl } from "@/lib/utils";
import { CheckoutItem } from "../components/checkout-item";
import { CheckoutSidebar } from "../components/checkout-sidebar";
import { InboxIcon, LoaderIcon } from "lucide-react";
// hooks
import { useCart } from "../../hooks/use-cart";
import { useCheckoutStates } from "../../hooks/use-checkout-states";
import { useRouter } from "next/navigation";

interface CheckoutViewProps {
  tenantSlug: string;
}

export const CheckoutView = ({ tenantSlug }: CheckoutViewProps) => {
  const router = useRouter();
  const [states, setStates] = useCheckoutStates();

  const { productIds, removeProduct, clearCart } = useCart(tenantSlug);

  const trpc = useTRPC();
  // this is from local storage:
  const { data, error, isLoading } = useQuery(
    trpc.checkout.getProducts.queryOptions({
      ids: productIds,
    })
  );

  const purchase = useMutation(
    trpc.checkout.purchase.mutationOptions({
      onMutate: () => {
        setStates({ success: false, cancel: false }); // reset states
      },
      onSuccess: (data) => {
        window.location.href = data.url; // success means that checkout link was created. we obtain the link
      },
      onError: (error) => {
        if (error?.data?.code === "UNAUTHORIZED") {
          // TODO: modify when subdomains enabled.
          router.push("/sign-in");
        }
        toast.error(error?.message);
      },
    })
  );
  // handle success and cancel states from the URL query params: clear states to avoid math depth error.
  useEffect(() => {
    if (states.success) {
      setStates({ success: false, cancel: false }); // reset states
      clearCart();
      // TODO: Invalidate library.
      router.push("/products");
    }
  }, [states.success, clearCart, router, setStates]);

  // error handling: remove invalid data (e.g. product no longer exists)
  useEffect(() => {
    if (!error) return;
    if (error?.data?.code == "NOT_FOUND") {
      // clearAllCarts();
      clearCart(); // clear only the current tenant cart
      toast.warning("Invalid products found, cart cleared.");
    }
  }, [error, clearCart]);

  // loading state: show skeleton while loading
  if (isLoading) {
    return (
      <div className="lg:pt-16 pt-4 px-4 lg:px-12">
        {" "}
        <div className="border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg">
          <LoaderIcon className="text-muted-foreground animate-spin" />
        </div>
      </div>
    );
  }

  // loading states: will show if it is loaded and there is no data (same as in ProductList)
  if (data?.totalDocs === 0) {
    return (
      <div className="lg:pt-16 pt-4 px-4 lg:px-12">
        <div className="border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg">
          <InboxIcon />
          <p className="text-base font-medium">No products found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:pt-16 pt-4 px-4 lg:px-12">
      {/* {JSON.stringify(data, null, 2)} */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-16">
        {/* 2 columns: items & side-bar */}
        <div className="lg:col-span-4">
          {/* 1. Checkout Items: */}
          <div className="border rounded-md overflow-hidden bg-white">
            {data?.docs.map((product, index) => (
              <CheckoutItem
                key={product.id}
                isLast={index === data.docs.length - 1}
                imageUrl={product.image?.url}
                name={product.name}
                productUrl={`${generateTenantUrl(product.tenant.slug)}/products/${product.id}`}
                tenantUrl={generateTenantUrl(product.tenant.slug)}
                tenantName={product.tenant.name}
                price={product.price}
                onRemove={() => removeProduct(product.id)}
              />
            ))}
          </div>
        </div>
        {/* 2. Checkout Sidebar */}
        <div className="lg:col-span-3">
          <CheckoutSidebar
            total={data?.totalPrice || 0}
            onPurchase={() => purchase.mutate({ tenantSlug, productIds })}
            isCanceled={states.cancel}
            disabled={purchase.isPending}
          />
        </div>
      </div>
    </div>
  );
};
