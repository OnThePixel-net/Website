import { Button } from "@/components/ui/button";

export function SignOut() {
  return (
    <form
      action={async () => {
        "use server";
      }}
    >
      <Button type="submit">Sign Out</Button>
    </form>
  );
}
