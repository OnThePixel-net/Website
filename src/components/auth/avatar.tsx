import { auth } from "@/auth";
import Image from "next/image";

export default async function UserAvatar() {
  const session = await auth();

  if (!session || !session.user) return null;

  return (
    <div>
      <Image
        src={session.user.image ?? "/default-avatar.png"}
        alt="User Avatar"
      />
    </div>
  );
}
