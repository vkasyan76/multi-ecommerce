import { SignInView } from "@/modules/auth/ui/views/sign-in-view";
import { caller } from "@/trpc/server";
import { redirect } from "next/navigation";

const Page = async () => {
  // Disable the sign-in page if you are logged in:
  const session = await caller.auth.session();
  if (session.user) {
    redirect("/");
  }

  return <SignInView />;
};

export default Page;
