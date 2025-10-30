import { getClient } from '@/lib/contentful';

export const revalidate = 0;

async function getData() {
  const client = getClient(process.env.NEXT_PUBLIC_ENABLE_PREVIEW === 'true');
  return client.getEntries({
    content_type: 'page',
    include: 2,
    limit: 10,
  });
}

export default async function Debug() {
  const data = await getData();
  const items: any[] = data?.items ?? [];
  return (
    <main style={{ padding: 20 }}>
      <h1>Debug: pages</h1>
      <p>items.length: <b>{items.length}</b></p>
      <ul>
        {items.map((it: any) => (
          <li key={it.sys.id}>
            id: {it.sys.id} | slug: {(it.fields?.slug as any) || '(none)'} | type: {it.sys.contentType?.sys?.id}
          </li>
        ))}
      </ul>
    </main>
  );
}
