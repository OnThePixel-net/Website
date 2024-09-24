import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default async function Page() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <>
      <p>{}</p>
      {user ? `Welcome, ${user.name}!` : "Loading..."}
    </>
  );
}
