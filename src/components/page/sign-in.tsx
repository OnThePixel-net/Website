import { Button } from "@/components/ui/button";
import { FaDiscord } from "react-icons/fa";

export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
      }}
    >
      <Button
        type="submit"
        className="relative flex w-full items-center justify-center"
      >
        <FaDiscord className="absolute left-0 ml-[11px] size-5" />
        <span>Sign in with Discord</span>
      </Button>
    </form>
  );
}
