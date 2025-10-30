import { getClient } from '@/lib/contentful';
import GenericBlock from '@/components/GenericBlock';

export const revalidate = 60;

async function fetchPage(slug: string, preview = false) {
  const client = getClient(preview);
  const res = await client.getEntries({
    content_type: 'page',          // entspricht deiner "📜 Landing page" (ID = page)
    'fields.slug': slug,
    include: 3,
    limit: 1,
  });
  return res.items[0];
}

function flattenBlocks(page: any) {
  if (!page?.fields) return [];
  const { topSection, pageContent, extraSection } = page.fields;

  const a = Array.isArray(topSection) ? topSection : [];
  const b = pageContent ? [pageContent] : [];
  const c = Array.isArray(extraSection) ? extraSection : [];

  return [...a, ...b, ...c];
}

export default async function Page({ params }: { params: { slug: string } }) {
  const preview = process.env.NEXT_PUBLIC_ENABLE_PREVIEW === 'true';
  const page = await fetchPage(params.slug, preview);
  const blocks = flattenBlocks(page);

  return (
    <main className="mx-auto max-w-5xl p-6 grid gap-6">
      {blocks.map((b: any) => <GenericBlock key={b?.sys?.id} entry={b} />)}
    </main>
  );
}
