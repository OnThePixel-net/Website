import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { FaDiscord } from "react-icons/fa";

export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("discord", { redirectTo: "/profile" });
      }}
    >
      <Button
        type="submit"
        className="flex w-full justify-center items-center relative"
      >
        <FaDiscord className="size-5 absolute left-0 ml-[11px]" />
        <span>Sign in with Discord</span>
      </Button>
    </form>
  );
}
