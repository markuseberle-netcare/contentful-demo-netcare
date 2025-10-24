import { getClient } from '@/lib/contentful';
import Banner from '@/components/Banner';
import Teaser from '@/components/Teaser';
import RichTextBlock from '@/components/RichTextBlock';

export const revalidate = 60;

async function fetchPage(slug: string, preview = false) {
  const client = getClient(preview);
  const res = await client.getEntries({
    content_type: 'page',
    'fields.slug': slug,
    include: 3,
    limit: 1,
  });
  return res.items[0];
}

function renderBlock(block: any) {
  const ct = block?.sys?.contentType?.sys?.id;
  if (ct === 'banner') return <Banner key={block.sys.id} data={block} />;
  if (ct === 'teaser') return <Teaser key={block.sys.id} data={block} />;
  if (ct === 'richTextBlock') return <RichTextBlock key={block.sys.id} data={block} />;
  return null;
}

export default async function Page({ params }: { params: { slug: string } }) {
  const preview = process.env.NEXT_PUBLIC_ENABLE_PREVIEW === 'true';
  const page = await fetchPage(params.slug, preview);
  const blocks = page?.fields?.blocks || [];
  return (
    <main className="grid gap-6">
      {blocks.map((b: any) => renderBlock(b))}
    </main>
  );
}
