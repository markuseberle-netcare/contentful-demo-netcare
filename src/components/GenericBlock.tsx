'use client';

import { BLOCKS, INLINES, Document } from '@contentful/rich-text-types';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

// -------- Utils: Finder für Rich/Plain, inkl. Durchlauf verlinkter Entries --------

function isRichDoc(val: any): val is Document {
  return !!val && typeof val === 'object' && val.nodeType === 'document';
}

// Alle üblichen Feldnamen, die im Learning Path für Text vorkommen
const RICH_CANDIDATES = ['body', 'content', 'copy', 'text', 'description', 'abstract', 'excerpt', 'richText'];
const PLAIN_CANDIDATES = ['summary', 'teaser', 'description', 'abstract', 'excerpt', 'body', 'text', 'copy'];

function pickImageUrl(f: any): string | undefined {
  const candidates = [
    f?.image,
    f?.backgroundImage,
    f?.media,
    f?.heroImage,
    f?.asset,
    Array.isArray(f?.images) ? f.images[0] : undefined,
    Array.isArray(f?.media) ? f.media[0] : undefined,
  ];
  for (const c of candidates) {
    const url = c?.fields?.file?.url;
    if (typeof url === 'string' && url) {
      return url.startsWith('http') ? url : `https:${url}`;
    }
  }
  return undefined;
}

// Holt Rich-Text direkt aus Feldern
function pickRichDirect(f: any): Document | undefined {
  for (const k of RICH_CANDIDATES) {
    const v = f?.[k];
    if (isRichDoc(v)) return v;
  }
  return undefined;
}

// Holt Plain-Text direkt aus Feldern
function pickPlainDirect(f: any): string | undefined {
  for (const k of PLAIN_CANDIDATES) {
    const v = f?.[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
}

// Sucht Rich-Text auch in verlinkten Entries/Arrays (eine Ebene tief)
function pickRichFromLinks(f: any): Document | undefined {
  const candidates: any[] = [];

  // Alle Felder einsammeln, die wie Link-Entries aussehen (objekt mit .fields)
  for (const key of Object.keys(f || {})) {
    const val = f[key];
    if (val?.fields) candidates.push(val);
    if (Array.isArray(val)) {
      for (const item of val) if (item?.fields) candidates.push(item);
    }
  }

  for (const entry of candidates) {
    // 1) Direkt in den Fields suchen
    const direct = pickRichDirect(entry.fields);
    if (direct) return direct;

    // 2) Falls dort wieder Links/Arrays liegen, eine Ebene tiefer schauen
    for (const innerKey of Object.keys(entry.fields || {})) {
      const inner = entry.fields[innerKey];
      if (isRichDoc(inner)) return inner;
      if (inner?.fields) {
        const d = pickRichDirect(inner.fields);
        if (d) return d;
      }
      if (Array.isArray(inner)) {
        for (const it of inner) {
          if (isRichDoc(it)) return it;
          if (it?.fields) {
            const d2 = pickRichDirect(it.fields);
            if (d2) return d2;
          }
        }
      }
    }
  }

  return undefined;
}

// Plain-Text auch aus verlinkten Entries/Arrays (eine Ebene tief)
function pickPlainFromLinks(f: any): string | undefined {
  const candidates: any[] = [];
  for (const key of Object.keys(f || {})) {
    const val = f[key];
    if (val?.fields) candidates.push(val);
    if (Array.isArray(val)) {
      for (const item of val) if (item?.fields) candidates.push(item);
    }
  }
  for (const entry of candidates) {
    const direct = pickPlainDirect(entry.fields);
    if (direct) return direct;
  }
  return undefined;
}

export default function GenericBlock({ entry }: { entry: any }) {
  const ct: string | undefined = entry?.sys?.contentType?.sys?.id;
  const f: any = entry?.fields || {};

  const imgUrl = pickImageUrl(f);

  // Rich/Plain zunächst direkt, dann via Links finden
  const rich: Document | undefined = pickRichDirect(f) ?? pickRichFromLinks(f);
  const plain: string | undefined = pickPlainDirect(f) ?? pickPlainFromLinks(f);

  const title: string =
    f?.title || f?.heading || f?.headline || f?.internalName || f?.pageName || '';
  const subtitle: string = f?.subline || f?.subheading || f?.eyebrow || '';

  const ctaLabel: string | undefined = f?.ctaLabel || f?.ctaText || undefined;
  const ctaUrl: string | undefined = f?.ctaUrl || f?.ctaLink || f?.url || undefined;

  // ============ HERO (volle Breite, höher) ============
  if (ct === 'componentHeroBanner') {
    return (
      <section className="col-span-full rounded-2xl p-0 shadow border">
        {imgUrl && (
          <img
            src={imgUrl}
            alt={title}
            className="w-full h-96 md:h-[480px] object-cover rounded-2xl"
          />
        )}
        <div className="p-6">
          {title && <h2 className="text-3xl md:text-4xl font-semibold mb-2">{title}</h2>}
          {subtitle && <p className="text-lg opacity-80 mb-3">{subtitle}</p>}
          {ctaLabel && ctaUrl && (
            <a className="inline-block rounded-xl px-4 py-2 border" href={ctaUrl}>
              {ctaLabel}
            </a>
          )}
        </div>
      </section>
    );
  }

  // ============ DUPLEX (Bild + Text) ============
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
                    <a href={(node.data as any).uri} className="underline">
                      {children}
                    </a>
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
              <a className="inline-block rounded-xl px-4 py-2 border" href={ctaUrl}>
                {ctaLabel}
              </a>
            </div>
          )}
        </div>
      </section>
    );
  }

  // ============ TEXTBLOCK ============
  if (ct === 'componentTextBlock' && (rich || plain)) {
    return (
      <article className="rounded-2xl p-6 shadow border prose max-w-none">
        {title && <h3>{title}</h3>}
        {rich
          ? documentToReactComponents(rich, {
              renderNode: {
                [INLINES.HYPERLINK]: (node, children) => (
                  <a href={(node.data as any).uri} className="underline">
                    {children}
                  </a>
                ),
                [BLOCKS.EMBEDDED_ASSET]: () => null,
              },
            })
          : <p>{plain}</p>}
      </article>
    );
  }

  // ============ GENERISCH (z. B. Teaser/InfoBlock) ============
  return (
    <article className="rounded-2xl p-6 shadow border bg-black/20">
      {(title || ct) && <h3 className="text-xl font-medium mb-2">{title || ct}</h3>}

      {imgUrl && (
        <img
          src={imgUrl}
          alt={title || ct || ''}
          className="w-full h-48 object-cover rounded-xl mb-3"
        />
      )}

      {rich ? (
        <div className="prose max-w-none">
          {documentToReactComponents(rich, {
            renderNode: {
              [INLINES.HYPERLINK]: (node, children) => (
                <a href={(node.data as any).uri} className="underline">
                  {children}
                </a>
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
          <a className="inline-block rounded-xl px-4 py-2 border" href={ctaUrl}>
            {ctaLabel}
          </a>
        </div>
      )}
    </article>
  );
}
