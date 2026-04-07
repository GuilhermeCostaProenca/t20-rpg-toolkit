import { redirect } from "next/navigation";

type WorldPageProps = {
  params: Promise<{ id: string }>;
};

export default async function WorldIndexPage({ params }: WorldPageProps) {
  const { id } = await params;
  redirect(`/app/worlds/${id}/codex`);
}

