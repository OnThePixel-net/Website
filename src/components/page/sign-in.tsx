import { Button } from "@/components/ui/button";
import { FaDiscord } from "react-icons/fa";
import { signIn } from "@/auth"

export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("discord")
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
