import requireAuth from "@/utils/require-auth";
export const dynamic = "force-dynamic";

export default async function TestPage() {
  await requireAuth();

  return (
    <div className="">
      <div>login or signup</div>
    </div>
  );
}
