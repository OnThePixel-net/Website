import UserAvatar from "@/components/auth/avatar";
import TopPage from "@/components/page/top";

export default function MePage() {
  return (
    <section className="bg-gray-950 h-screen">
      <TopPage />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-5">USER PAGE</h1>
        <span>
          <UserAvatar />
        </span>
      </div>
    </section>
  );
}
