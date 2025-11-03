'use client';

import { BLOCKS, INLINES, Document } from '@contentful/rich-text-types';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

/** Helpers */
function isRichDoc(val: any): val is Document {
  return !!val && typeof val === 'object' && val.nodeType === 'document';
}

function pickImageUrl(f: any): string | undefined {
  const sources = [
    f?.image,
    f?.backgroundImage,
    f?.media,
    Array.isArray(f?.images) ? f.images[0] : undefined,
  ].filter(Boolean);

  for (const s of sources) {
    const url = s?.fields?.file?.url;
    if (typeof url === 'string' && url) {
      return url.startsWith('http') ? url : `https:${url}`;
    }
  }
  return undefined;
}

function pickRichGeneric(f: any): Document | undefined {
  const keys = ['bodyText', 'body', 'content', 'copy', 'text', 'richText'];
  for (const k of keys) {
    const v = f?.[k];
    if (isRichDoc(v)) return v;
  }
  return undefined;
}

function pickPlainGeneric(f: any): string | undefined {
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

/** CTA: Label + Href ermitteln (inkl. Reference `targetPage` → /{slug}) */
function pickCta(f: any): { label?: string; href?: string } {
  const label: string | undefined = f?.ctaLabel || f?.ctaText;

  let href: string | undefined = f?.ctaUrl || f?.ctaLink || f?.url;

  // Reference auf eine Page: slug → /slug
  if (!href) {
    const tp = f?.targetPage;
    if (tp?.sys?.type === 'Entry') {
      const slug: string | undefined = tp?.fields?.slug || tp?.fields?.pageSlug;
      if (slug) href = `/${slug.replace(/^\/+/, '')}`;
    }
  }
  return { label, href };
}

/** Component */
export default function GenericBlock({ entry }: { entry: any }) {
  const ct: string | undefined = entry?.sys?.contentType?.sys?.id;
  const f: any = entry?.fields || {};

  const imgUrl = pickImageUrl(f);
  const title: string =
    f?.title || f?.heading || f?.headline || f?.internalName || f?.pageName || '';
  const subtitle: string = f?.subline || f?.subheading || f?.eyebrow || '';

  const { label: ctaLabel, href: ctaHref } = pickCta(f);

  /** HERO (volle Breite) */
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
          {ctaLabel && ctaHref && (
            <a className="inline-block rounded-xl px-4 py-2 border" href={ctaHref}>
              {ctaLabel}
            </a>
          )}
        </div>
      </section>
    );
  }

  /** DUPLEX – gestapelt (Bild oben, Text unten) */
  if (ct === 'componentDuplex') {
    const body: Document | undefined = f?.bodyText || pickRichGeneric(f);
    const plain = pickPlainGeneric(f);

    return (
      <section className="rounded-2xl p-0 shadow border overflow-hidden">
        {imgUrl && (
          <img src={imgUrl} alt={title} className="w-full h-64 md:h-80 object-cover" />
        )}
        <div className="p-6">
          {(title || subtitle) && (
            <header className="mb-3">
              {title && <h3 className="text-2xl font-semibold">{title}</h3>}
              {subtitle && <p className="opacity-80">{subtitle}</p>}
            </header>
          )}

          {isRichDoc(body) ? (
            <div className="prose max-w-none">
              {documentToReactComponents(body, {
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

          {ctaLabel && ctaHref && (
            <div className="mt-4">
              <a className="inline-block rounded-xl px-4 py-2 border" href={ctaHref}>
                {ctaLabel}
              </a>
            </div>
          )}
        </div>
      </section>
    );
  }

  /** TEXTBLOCK (Rich Text in `body`) */
  if (ct === 'componentTextBlock' && isRichDoc(f?.body)) {
    return (
      <article className="rounded-2xl p-6 shadow border prose max-w-none">
        {title && <h3>{title}</h3>}
        {documentToReactComponents(f.body, {
          renderNode: {
            [INLINES.HYPERLINK]: (node, children) => (
              <a href={(node.data as any).uri} className="underline">
                {children}
              </a>
            ),
            [BLOCKS.EMBEDDED_ASSET]: () => null,
          },
        })}
      </article>
    );
  }

  /** GENERISCHE TEASER (gestapelt) */
  const rich = pickRichGeneric(f);
  const plain = pickPlainGeneric(f);

  return (
    <article className="rounded-2xl p-6 shadow border bg-black/20">
      {imgUrl && (
        <img
          src={imgUrl}
          alt={title || ct || ''}
          className="w-full h-48 object-cover rounded-xl mb-4"
        />
      )}

      {(title || ct) && (
        <h3 className="text-xl font-medium mb-2">{title || ct}</h3>
      )}

      {isRichDoc(rich) ? (
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

      {ctaLabel && ctaHref && (
        <div className="mt-4">
          <a className="inline-block rounded-xl px-4 py-2 border" href={ctaHref}>
            {ctaLabel}
          </a>
        </div>
      )}
    </article>
  );
}
