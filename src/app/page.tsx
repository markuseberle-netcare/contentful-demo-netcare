import { getClient } from '@/lib/contentful';
import Banner from '@/components/Banner';
import Teaser from '@/components/Teaser';
import RichTextBlock from '@/components/RichTextBlock';
import GenericBlock from '../components/GenericBlock';


export const revalidate = 60;

async function fetchPage(preview = false) {
  const client = getClient(preview);
  const res = await client.getEntries({
    content_type: 'page',
    'fields.slug': 'home',
    include: 3,
    limit: 1,
  });
  return res.items[0];
}

function renderBlock(block: any) {
  const ct = block?.sys?.contentType?.sys?.id;
  if (ct === 'banner') return <Banner key={block.sys?.id} data={block} />;
  if (ct === 'teaser') return <Teaser key={block.sys?.id} data={block} />;
  if (ct === 'richTextBlock') return <RichTextBlock key={block.sys?.id} data={block} />;
  return null;
}

export default async function Home() {
  const preview = process.env.NEXT_PUBLIC_ENABLE_PREVIEW === 'true';
  const page = await fetchPage(preview);

  // Sicherstellen, dass blocks ein Array ist
  const rawBlocks: any = (page as any)?.fields?.blocks;
  const blocks: any[] = Array.isArray(rawBlocks) ? rawBlocks : [];

  return (
    <main className="mx-auto max-w-6xl p-6 grid gap-6 md:grid-cols-2">
  {blocks.map((b: any) => <GenericBlock key={b?.sys?.id} entry={b} />)}
</main>
  );
}
