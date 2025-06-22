"use client";

import { useTRPC } from "@/trpc/client";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";

const Page = () => {
  const trpc = useTRPC();
  const { mutate: verify } = useMutation(
    trpc.checkout.verify.mutationOptions({
      onSuccess: (data) => {
        window.location.href = data.url; // Redirect to the URL returned by the mutation
      },
      onError: () => {
        window.location.href = "/"; // Redirect to home page on error
      },
    })
  );
  useEffect(() => {
    // Call the verify mutation when the component mounts
    verify();
  }, [verify]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoaderIcon className="animate-spin text-muted-foreground" />
    </div>
  );
};

export default Page;
