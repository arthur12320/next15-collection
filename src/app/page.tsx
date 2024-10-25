import { Button } from "@/components/ui/button";
import { getUsers } from "@/lib/queries";

export default async function Home() {
  const users = await getUsers();
  return (
    <div>
      <h1 className="text-4xl font-bold">React test</h1>
      <Button>Click me</Button>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.username}</li>
        ))}
      </ul>
    </div>
  );
}
