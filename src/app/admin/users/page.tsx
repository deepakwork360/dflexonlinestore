import { prisma } from "@/lib/prisma";
import UsersManager from "./UsersManager";

export default async function AdminUsersPage() {
  // Query all users ordered by newest sign-ups
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  // Serialize Prisma models containing dates and decimals to plain objects
  const serializedUsers = JSON.parse(JSON.stringify(users));

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      <UsersManager initialUsers={serializedUsers} />
    </main>
  );
}
