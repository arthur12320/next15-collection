import { getUsers } from "@/lib/queries";

export default async function Home() {
  const users = await getUsers();
  return (
    <div>
      <h1>React test</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.username}</li>
        ))}
      </ul>
    </div>
  );
}
