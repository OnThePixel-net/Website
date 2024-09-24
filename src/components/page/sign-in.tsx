import { Button } from "@/components/ui/button";

export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
      }}
    >
      <Button type="submit">Signin with Discord</Button>
    </form>
  );
}
