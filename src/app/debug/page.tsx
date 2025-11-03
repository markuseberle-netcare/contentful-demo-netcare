import { getClient } from '@/lib/contentful';

export const revalidate = 0;

function kind(v: any): string {
  if (!v) return 'null';
  if (typeof v === 'string') return `string(${v.length})`;
  if (Array.isArray(v)) return `array(${v.length})`;
  if (v?.nodeType === 'document') return 'rich-text';
  if (v?.sys?.type === 'Entry') return `entry:${v.sys?.contentType?.sys?.id}`;
  if (v?.sys?.type === 'Asset') return 'asset';
  if (typeof v === 'object') return 'object';
  return typeof v;
}

export default async function Inspect() {
  const client = getClient(process.env.NEXT_PUBLIC_ENABLE_PREVIEW === 'true');
  const res = await client.getEntries({
    content_type: 'page',
    'fields.slug': 'home',
    include: 4,
    limit: 1,
  });
  const page = res.items?.[0] as any;
  const fields = page?.fields ?? {};
  const blocks = [
    ...(Array.isArray(fields.topSection) ? fields.topSection : []),
    ...(fields.pageContent ? [fields.pageContent] : []),
    ...(Array.isArray(fields.extraSection) ? fields.extraSection : []),
  ];

  return (
    <main style={{padding:20,fontFamily:'ui-sans-serif'}}>
      <h1>Inspect: home blocks</h1>
      <ol style={{display:'grid', gap:16}}>
        {blocks.map((b:any, i:number) => {
          const ct = b?.sys?.contentType?.sys?.id;
          const f = b?.fields ?? {};
          return (
            <li key={b?.sys?.id} style={{border:'1px solid #444', borderRadius:12, padding:12}}>
              <div><b>#{i+1}</b> type: <code>{ct}</code> id: <code>{b?.sys?.id}</code></div>
              <ul style={{marginTop:8}}>
                {Object.keys(f).map(k=>{
                  const v = f[k];
                  return (
                    <li key={k} style={{marginBottom:6}}>
                      <code>{k}</code> → <i>{kind(v)}</i>
                      {Array.isArray(v) && v.length>0 && v[0]?.sys?.type==='Entry' && (
                        <div style={{marginLeft:12}}>
                          linked entries: {v.map((e:any)=> e?.sys?.contentType?.sys?.id).join(', ')}
                        </div>
                      )}
                      {v?.sys?.type==='Entry' && (
                        <div style={{marginLeft:12}}>
                          linked entry: {v?.sys?.contentType?.sys?.id}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </li>
          )
        })}
      </ol>
    </main>
  );
}
