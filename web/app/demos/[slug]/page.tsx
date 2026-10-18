import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { demos, getDemo } from "@/data/demos";
import { Tutorial } from "@/components/Tutorial";

export function generateStaticParams() {
  return demos.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const demo = getDemo(slug);
  if (!demo) return { title: "Demo not found" };
  return {
    title: `${demo.name} — Docker Cloud Sandboxes`,
    description: demo.tagline,
  };
}

export default async function DemoTutorial({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const demo = getDemo(slug);
  if (!demo) notFound();
  return <Tutorial demo={demo} />;
}
