import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function WorldVisualAliasPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/app/worlds/${id}/visual-library`);
}
