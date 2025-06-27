import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// automatic rewrite in production only
// export function generateTenantUrl(tenantSlug: string) {
//   // return `/tenants/${tenantSlug}`;
//   // return `/${tenantSlug}`;

//   // Rewrite subdomains:
//   if (process.env.NODE_ENV === "development") {
//     return `/tenants/${tenantSlug}`;
//   }

//   const protocol = "https";
//   const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN!;

//   // we render tenant slug and then domain:
//   return `${protocol}://${tenantSlug}.${domain}`;
// }

// automatic rewrite in development & production
export function generateTenantUrl(tenantSlug: string) {
  // return `/tenants/${tenantSlug}`;
  // return `/${tenantSlug}`;

  // Rewrite subdomains:
  // if (process.env.NODE_ENV === "development") {
  //   return `/tenants/${tenantSlug}`;
  // }

  // if (process.env.NODE_ENV === "development") {
  //   return `${process.env.NEXT_PUBLIC_APP_URL}/tenants/${tenantSlug}`;
  // }

  let protocol = "https";

  // const protocol = "https";
  const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN!;

  if (process.env.NODE_ENV === "development") {
    protocol = "http";
  }

  // we render tenant slug and then domain:
  return `${protocol}://${tenantSlug}.${domain}`;
}

export function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value));
}
