'use client';

import { BLOCKS, INLINES, Document } from '@contentful/rich-text-types';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

// -------- Utilities --------
function isRichDoc(val: any): val is Document {
  return !!val && typeof val === 'object' && val.nodeType === 'document';
}

const RICH_CANDIDATES = ['body', 'content', 'copy', 'text', 'richText'];
const PLAIN_CANDIDATES = ['summary', 'teaser', 'abstract', 'excerpt', 'body', 'text', 'copy'];

// Nur URL von Assets holen, KEIN description/alt als Text anzeigen
function pickImageUrl(f: any): string | undefined {
  const assetLike = (x: any) => x?.sys?.type === 'Asset' || x?.fields?.file?.url;
  const from = [
    f?.image, f?.backgroundImage, f?.media, f?.heroImage, f?.asset,
    Array.isArray(f?.images) ? f.images[0] : undefined,
    Array.isArray(f?.media) ? f.media[0] : undefined,
  ].filter(Boolean);

  for (const c of from) {
    const candidate = Array.isArray(c) ? c.find(assetLike) : c;
    const url = candidate?.fields?.file?.url;
    if (typeof url === 'string' && url) return url.startsWith('http') ? url : `https:${url}`;
  }
  return undefined;
}

function pickRichDirect(fields: any): Document | undefined {
  for (const k of RICH_CANDIDATES) {
    const v = fields?.[k];
    if (isRichDoc(v)) return v;
  }
  return undefined;
}

function pickPlainDirect(fields: any): string | undefined {
  for (const k of PLAIN_CANDIDATES) {
    const v = fields?.[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
}

// Nur verlinkte **Entries** (keine Assets) betrachten; 1 Ebene tief
function collectLinkedEntries(fields: any): any[] {
  const out: any[] = [];
  for (const key of Object.keys(fields || {})) {
    const val = fields[key];
    if (val?.sys?.type === 'Entry') out.push(val);
    if (Array.isArray(val)) {
      for (const it of val) if (it?.sys?.type === 'Entry') out.push(it);
    }
  }
  return out;
}

function pickRichFromLinks(fields: any): Document | undefined {
  const entries = collectLinkedEntries(fields);
  for (const e of entries) {
    const direct = pickRichDirect(e.fields);
    if (direct) return direct;
    // eine Ebene weiter in Entry-Feldern schauen (aber keine Assets)
    for (const k of Object.keys(e.fields || {})) {
      const v = e.fields[k];
      if (isRichDoc(v)) return v;
      if (v?.sys?.type === 'Entry') {
        const d2 = pickRichDirect(v.fields);
        if (d2) return d2;
      }
      if (Array.isArray(v)) {
        for (const it of v) {
          if (isRichDoc(it)) return it;
          if (it?.sys?.type === 'Entry') {
            const d3 = pickRichDirect(it.fields);
            if (d3) return d3;
          }
        }
      }
    }
  }
  return undefined;
}

function pickPlainFromLinks(fields: any): string | undefined {
  const entries = collectLinkedEntries(fields);
  for (const e of entries) {
    const direct = pickPlainDirect(e.fields);
    if (direct) return direct;
  }
  return undefined;
}

// -------- Component --------
export default function GenericBlock({ entry }: { entry: any }) {
  const ct: string | undefined = entry?.sys?.contentType?.sys?.id;
  const f: any = entry?.fields || {};

  const imgUrl = pickImageUrl(f);
  // Erst direkt in diesem Entry, dann in verlinkten **Entries** (keine Assets)
  const rich: Document | undefined = pickRichDirect(f) ?? pickRichFromLinks(f);
  const plain: string | undefined = pickPlainDirect(f) ?? pickPlainFromLinks(f);

  const title: string =
    f?.title || f?.heading || f?.headline || f?.internalName || f?.pageName || '';
  const subtitle: string = f?.subline || f?.subheading || f?.eyebrow || '';

  const ctaLabel: string | undefined = f?.ctaLabel || f?.ctaText || undefined;
  const ctaUrl: string | undefined = f?.ctaUrl || f?.ctaLink || f?.url || undefined;

  // HERO (volle Breite)
  if (ct === 'componentHeroBanner') {
    return (
      <section className="col-span-full rounded-2xl p-0 shadow border">
        {imgUrl && (
          <img src={imgUrl} alt={title} className="w-full h-96 md:h-[480px] object-cover rounded-2xl" />
        )}
        <div className="p-6">
          {title && <h2 className="text-3xl md:text-4xl font-semibold mb-2">{title}</h2>}
          {subtitle && <p className="text-lg opacity-80 mb-3">{subtitle}</p>}
          {ctaLabel && ctaUrl && (
            <a className="inline-block rounded-xl px-4 py-2 border" href={ctaUrl}>{ctaLabel}</a>
          )}
        </div>
      </section>
    );
  }

  // DUPLEX (Bild + Text nebeneinander) – Body priorisiert
  if (ct === 'componentDuplex') {
    return (
      <section className="rounded-2xl p-0 shadow border grid gap-4 md:grid-cols-2 overflow-hidden">
        {imgUrl && (
          <div className="relative">
            <img src={imgUrl} alt={title} className="w-full h-64 md:h-full object-cover" />
          </div>
        )}
        <div className="p-6">
          {(title || subtitle) && (
            <header className="mb-3">
              {title && <h3 className="text-2xl font-semibold">{title}</h3>}
              {subtitle && <p className="opacity-80">{subtitle}</p>}
            </header>
          )}
          {rich ? (
            <div className="prose max-w-none">
              {documentToReactComponents(rich, {
                renderNode: {
                  [INLINES.HYPERLINK]: (node, children) => (
                    <a href={(node.data as any).uri} className="underline">{children}</a>
                  ),
                  [BLOCKS.EMBEDDED_ASSET]: () => null,
                },
              })}
            </div>
          ) : (
            plain && <p className="opacity-90">{plain}</p>
          )}
          {ctaLabel && ctaUrl && (
            <div className="mt-4">
              <a className="inline-block rounded-xl px-4 py-2 border" href={ctaUrl}>{ctaLabel}</a>
            </div>
          )}
        </div>
      </section>
    );
  }

  // TEXTBLOCK
  if (ct === 'componentTextBlock' && (rich || plain)) {
    return (
      <article className="rounded-2xl p-6 shadow border prose max-w-none">
        {title && <h3>{title}</h3>}
        {rich
          ? documentToReactComponents(rich, {
              renderNode: {
                [INLINES.HYPERLINK]: (node, children) => (
                  <a href={(node.data as any).uri} className="underline">{children}</a>
                ),
                [BLOCKS.EMBEDDED_ASSET]: () => null,
              },
            })
          : <p>{plain}</p>}
      </article>
    );
  }

  // GENERISCH (z. B. Teaser/InfoBlock)
  return (
    <article className="rounded-2xl p-6 shadow border bg-black/20">
      {(title || ct) && <h3 className="text-xl font-medium mb-2">{title || ct}</h3>}
      {imgUrl && <img src={imgUrl} alt={title || ct || ''} className="w-full h-48 object-cover rounded-xl mb-3" />}
      {rich ? (
        <div className="prose max-w-none">
          {documentToReactComponents(rich, {
            renderNode: {
              [INLINES.HYPERLINK]: (node, children) => (
                <a href={(node.data as any).uri} className="underline">{children}</a>
              ),
              [BLOCKS.EMBEDDED_ASSET]: () => null,
            },
          })}
        </div>
      ) : (
        plain && <p className="opacity-90">{plain}</p>
      )}
      {ctaLabel && ctaUrl && (
        <div className="mt-4">
          <a className="inline-block rounded-xl px-4 py-2 border" href={ctaUrl}>{ctaLabel}</a>
        </div>
      )}
    </article>
  );
}
