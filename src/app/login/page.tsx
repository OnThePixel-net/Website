import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { Button } from "@/components/ui/button";
import { FaDiscord } from "react-icons/fa";
import Image from "next/image";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";

const SIGNIN_ERROR_URL = "/login/error";

export default async function SignInPage(props: {
  searchParams: { callbackUrl: string | undefined };
}) {
  return (
    <>
      <div
        key="1"
        className="relative min-h-screen flex flex-col items-center justify-center text-white"
      >
        <div className="absolute inset-0 -z-10">
          <Image
            alt="Background Image"
            className="object-cover w-full h-full filter brightness-75"
            height="1080"
            src="/bg.png"
            style={{
              aspectRatio: "1920/1080",
              objectFit: "cover",
            }}
            width="1920"
          />
          <div className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-950" />
        </div>

        <main className="bg-popover max-w-lg mx-auto my-4 rounded-lg p-10">
          <h1 className="text-2xl font-bold text-center">
            Sign in to your account
          </h1>
          <div className="mt-4">
            {/* <form
              action={async () => {
                "use server";
                try {
                  await signIn("discord", {
                    redirectTo: props.searchParams?.callbackUrl ?? "/dashboard",
                  });
                } catch (error) {
                  if (error instanceof AuthError) {
                    return redirect(`/api/auth/login?error=${error.type}`);
                  }
                  throw error;
                }
              }}
            >
              <Button
                type="submit"
                className="flex w-full justify-center items-center relative"
              >
                <FaDiscord className="size-5 absolute left-0 ml-[11px]" />
                <span>Sign in with Discord</span>
              </Button>
            </form> */}
            <LoginLink>Sign in</LoginLink>
          </div>
        </main>
      </div>
    </>
  );
}
