import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// the store will hold each tenant's cart
interface TenantCart {
  productIds: string[];
}

interface CartState {
  tenantCarts: Record<string, TenantCart>;
  addProduct: (tenantSlug: string, productId: string) => void;
  removeProduct: (tenantSlug: string, productId: string) => void;
  clearCart: (tenantSlug: string) => void;
  clearAllCarts: () => void;
  // getCartByTenant: (tenantSlug: string) => string[];   // we call tenantCarts directly in src\modules\checkout\hooks\use-cart.ts
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      tenantCarts: {},
      addProduct: (tenantSlug, productId) =>
        set((state) => ({
          tenantCarts: {
            ...state.tenantCarts,
            [tenantSlug]: {
              productIds: [
                ...(state.tenantCarts[tenantSlug]?.productIds || []),
                productId,
              ],
            },
          },
        })),
      removeProduct: (tenantSlug, productId) =>
        set((state) => ({
          tenantCarts: {
            ...state.tenantCarts,
            [tenantSlug]: {
              productIds:
                state.tenantCarts[tenantSlug]?.productIds.filter(
                  (id) => id !== productId
                ) || [],
            },
          },
        })),
      clearCart: (tenantSlug) =>
        set((state) => ({
          tenantCarts: {
            ...state.tenantCarts,
            [tenantSlug]: {
              // we call tenantCarts directly in src\modules\checkout\hooks\use-cart.ts
              productIds: [],
            },
          },
        })),
      clearAllCarts: () => set({ tenantCarts: {} }),
      // we call tenantCarts directly in src\modules\checkout\hooks\use-cart.ts - no need for getCartByTenant method
      // getCartByTenant: (tenantSlug) =>
      //   get().tenantCarts[tenantSlug]?.productIds || [],
    }),
    // properties how we want to save this card:
    {
      name: "funroad-cart", // name of the storage
      storage: createJSONStorage(() => localStorage), // use localStorage to persist the cart
    }
  )
);
