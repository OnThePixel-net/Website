import { Button } from "@/components/ui/button";

export function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
      }}
    >
      <Button type="submit">Sign in</Button>
    </form>
  );
}
