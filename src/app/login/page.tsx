import { Button } from "@/components/ui/button";
import { FaDiscord } from "react-icons/fa";
import Image from "next/image";
import {
  Card,
  CardFooter,
  CardTitle,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";

export default async function SignInPage(props: {
  searchParams: Promise<{ callbackUrl: string | undefined }>;
}) {
  const { callbackUrl } = await props.searchParams;

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
        <Card className="w-[380px]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Sign in to your account
            </CardTitle>
            <CardDescription>Sign in with Discord to continue</CardDescription>
          </CardHeader>
          <CardFooter className="mt-8">
            <form
              className="w-full"
              action={async () => {
                "use server";
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
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
