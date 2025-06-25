import { z } from "zod"; // 'z' is defined but never used.
import { useState } from "react"; // 'useState' is defined but never used.
import { useForm } from "react-hook-form"; // 'useForm' is defined but never used.
import { zodResolver } from "@hookform/resolvers/zod"; // 'zodResolver' is defined but never used.

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button"; // 'Button' is defined but never used.
import { Textarea } from "@/components/ui/textarea"; // 'Textarea' is defined but never used.
import { StarPicker } from "@/components/star-picker";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"; // 'Form', 'FormField', 'FormItem', 'FormLabel', 'FormControl', and 'FormMessage' are defined but never used.

import { ReviewsGetOneOutput } from "@/modules/reviews/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Props {
  productId: string;
  initialData?: ReviewsGetOneOutput;
}

// form schema as in the procedure:
const formSchema = z.object({
  rating: z.number().min(1, { message: "Rating is required" }).max(5),
  description: z
    .string()
    .min(1, { message: "Description is required" })
    .max(500, {
      message: "Description must be less than 500 characters",
    }),
});

export const ReviewForm = ({ productId, initialData }: Props) => {
  // add state to indicate that we prereview existing review
  const [isPreview, setIsPreview] = useState(!!initialData);

  const trpc = useTRPC(); // for creating and updating reviews
  const queryClient = useQueryClient(); // for invalidating queries after creating or updating a review
  const createReview = useMutation(
    trpc.reviews.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.reviews.getOne.queryOptions({
            productId,
          })
        );
        setIsPreview(true); // set preview mode after creating a review
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const updateReview = useMutation(
    trpc.reviews.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.reviews.getOne.queryOptions({
            productId,
          })
        );
        setIsPreview(true); // set preview mode after creating a review
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  // use the initial data or fall back to 0 or "".
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: initialData?.rating ?? 0,
      description: initialData?.description ?? "",
    },
  });
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // console.log(values);
    if (initialData) {
      // if we have initial data, we update the review
      updateReview.mutate({
        reviewId: initialData.id,
        rating: values.rating,
        description: values.description,
      });
    } else {
      // if we don't have initial data, we create a new review
      createReview.mutate({
        productId,
        rating: values.rating,
        description: values.description,
      });
    }
  };
  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-y-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <p className="font-medium">
          {isPreview ? "Your rating:" : "Liked it? Give it a rating"}
        </p>
        {/* Rating Form Field */}
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <StarPicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isPreview}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Text Form Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Want to leave a written review?"
                  disabled={isPreview}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!isPreview && (
          <Button
            variant="elevated"
            disabled={createReview.isPending || updateReview.isPending} // disable the button while the mutation is pending
            type="submit"
            size="lg"
            className="bg-black text-white hover:bg-pink-400 hover:text-primary w-fit"
          >
            {initialData ? "Update review" : "Post review"}
          </Button>
        )}
      </form>
      {isPreview && (
        <Button
          onClick={() => setIsPreview(false)}
          size="lg"
          type="button"
          variant="elevated"
          className="w-fit mt-4"
        >
          Edit
        </Button>
      )}
    </Form>
  );
};

export const ReviewFormSkeleton = () => {
  return (
    <div className="flex flex-col gap-y-4">
      <p className="font-medium">Liked it? Give it a rating</p>
      <StarPicker disabled />
      <Textarea placeholder="Want to leave a written review?" disabled />
      <Button
        variant="elevated"
        disabled
        type="button"
        size="lg"
        className="bg-black text-white hover:bg-pink-400 hover:text-primary w-fit"
      >
        Post review
      </Button>
    </div>
  );
};
