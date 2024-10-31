import { Card, CardContent } from "@/components/ui/card";

export default async function TestPage() {
  return (
    <Card className="mx-auto max-w-2xl mt-10">
      <CardContent>
        <h1 className="text-5xl mt-5">Collections</h1>
      </CardContent>
    </Card>
  );
}
