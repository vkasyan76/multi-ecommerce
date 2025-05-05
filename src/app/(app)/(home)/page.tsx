import { getQueryClient, trpc } from "@/trpc/server";

export default async function Home() {
  const queryClient = getQueryClient();
  const categories = await queryClient.fetchQuery(
    trpc.categories.getMany.queryOptions()
  );

  return (
    <div>
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
      {/* Home Page */}
      {JSON.stringify(categories, null, 2)}
    </div>
  );
}

// Earlier version to twick the styling:

// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Input } from "@/components/ui/input";
// import { Progress } from "@/components/ui/progress";
// import { Textarea } from "@/components/ui/textarea";

// export default function Home() {
//   return (
//     <div className="p-4">
//       <div className="flex flex-col gap-y-4">
//         <div>
//           <Button variant="elevated">I am a button</Button>
//         </div>
//         <Input placeholder="I am an input" />
//         <div>
//           <Progress value={50} />
//         </div>
//         <div>
//           <Textarea placeholder="I am a textarea" />
//         </div>
//         <div>
//           <Checkbox />
//         </div>
//       </div>
//     </div>
//   );
// }
