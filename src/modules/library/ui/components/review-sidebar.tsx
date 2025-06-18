import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ReviewForm } from "./review-form";

interface Props {
  productId: string;
}
export const ReviewSidebar = ({ productId }: Props) => {
  const trpc = useTRPC();
  //   Throws a promise while loading, so you must wrap your component in a <Suspense> boundary.
  const { data } = useSuspenseQuery(
    trpc.reviews.getOne.queryOptions({ productId })
  );

  return (
    //   <div>{JSON.stringify(data, null, 2)}</div>
    <ReviewForm productId={productId} initialData={data} />
  );
};
