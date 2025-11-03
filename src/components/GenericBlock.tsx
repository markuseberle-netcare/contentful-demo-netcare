'use client';

import { BLOCKS, INLINES, Document } from '@contentful/rich-text-types';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

function isRichDoc(val: any): val is Document {
  return !!val && typeof val === 'object' && val.nodeType === 'document';
}

function pickRich(f: any): Document | undefined {
  // häufige Feldnamen im Learning Path
  const keys = [
    'body',
    'content',
    'copy',
    'text',
    'description',
    'abstract',
    'excerpt',
    'richText',
  ];
  for (const k of keys) {
    const v = f?.[k];
    if (isRichDoc(v)) return v;
  }
  return undefined;
}

function pickPlain(f: any): string | undefined {
  // falls kein RichText vorhanden ist
  const keys = [
    'summary',
    'teaser',
    'description',
    'abstract',
    'excerpt',
    'body',
    'text',
    'copy',
  ];
  for (const k of keys) {
    const v = f?.[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
}

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

export default function GenericBlock({ entry }: { entry: any }) {
  const ct: string | undefined = entry?.sys?.contentType?.sys?.id;
  const f: any = entry?.fields || {};

  const imgUrl = pickImageUrl(f);
  const rich: Document | undefined = pickRich(f);

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
    const plain = pickPlain(f);
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

  // ============ TEXTBLOCK (reiner Rich Text) ============
  if (ct === 'componentTextBlock' && (rich || pickPlain(f))) {
    const plain = pickPlain(f);
    return (
      <article className="rounded-2xl p-6 shadow border prose max-w-none">
        {title && <h3>{title}</h3>}
        {rich ? (
          documentToReactComponents(rich, {
            renderNode: {
              [INLINES.HYPERLINK]: (node, children) => (
                <a href={(node.data as any).uri} className="underline">
                  {children}
                </a>
              ),
              [BLOCKS.EMBEDDED_ASSET]: () => null,
            },
          })
        ) : (
          plain && <p>{plain}</p>
        )}
      </article>
    );
  }

  // ============ GENERISCHER FALL (z. B. "Teaser"/InfoBlock) ============
  const plain = pickPlain(f);
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
