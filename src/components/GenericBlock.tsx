'use client';

import { BLOCKS, INLINES, Document } from '@contentful/rich-text-types';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

/**
 * Utility: prüft, ob ein Objekt ein echtes Rich Text Document ist
 */
function isRichDoc(val: any): val is Document {
  return !!val && typeof val === 'object' && val.nodeType === 'document';
}

/**
 * Utility: extrahiert die Bild-URL aus möglichen Feldern
 */
function pickImageUrl(f: any): string | undefined {
  const sources = [
    f?.image,
    f?.backgroundImage,
    f?.media,
    Array.isArray(f?.images) ? f.images[0] : undefined,
  ].filter(Boolean);

  for (const s of sources) {
    const url = s?.fields?.file?.url;
    if (typeof url === 'string') {
      return url.startsWith('http') ? url : `https:${url}`;
    }
  }
  return undefined;
}

/**
 * Hauptkomponente: rendert dynamisch generische Contentful-Blöcke
 */
export default function GenericBlock({ entry }: { entry: any }) {
  const ct: string | undefined = entry?.sys?.contentType?.sys?.id;
  const f: any = entry?.fields || {};

  const imgUrl = pickImageUrl(f);
  const title: string =
    f?.title || f?.heading || f?.headline || f?.internalName || f?.pageName || '';
  const subtitle: string = f?.subline || f?.subheading || f?.eyebrow || '';

  const ctaLabel: string | undefined = f?.ctaLabel || f?.ctaText;
  const ctaUrl: string | undefined = f?.ctaUrl || f?.ctaLink || f?.url;

  /**
   * RENDER: Hero Banner (volle Breite)
   */
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

  /**
   * RENDER: Duplex-Komponente (Bild + Bodytext nebeneinander)
   */
  if (ct === 'componentDuplex') {
    const body: Document | undefined = f?.bodyText; // direktes Rich Text Feld

    return (
      <section className="rounded-2xl p-0 shadow border grid gap-4 md:grid-cols-2 overflow-hidden">
        {imgUrl && (
          <div className="relative">
            <img
              src={imgUrl}
              alt={title}
              className="w-full h-64 md:h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          {(title || subtitle) && (
            <header className="mb-3">
              {title && <h3 className="text-2xl font-semibold">{title}</h3>}
              {subtitle && <p className="opacity-80">{subtitle}</p>}
            </header>
          )}

          {/* ✅ Bodytext aus dem Rich Text Feld */}
          {isRichDoc(body) && (
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
          )}

          {ctaLabel && ctaUrl && (
            <div className="mt-4">
              <a
                className="inline-block rounded-xl px-4 py-2 border"
                href={ctaUrl}
              >
                {ctaLabel}
              </a>
            </div>
          )}
        </div>
      </section>
    );
  }

  /**
   * RENDER: Textblock
   */
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

  /**
   * RENDER: Generischer Fallback
   */
  return (
    <article className="rounded-2xl p-6 shadow border bg-black/20">
      {(title || ct) && (
        <h3 className="text-xl font-medium mb-2">{title || ct}</h3>
      )}
      {imgUrl && (
        <img
          src={imgUrl}
          alt={title || ct || ''}
          className="w-full h-48 object-cover rounded-xl mb-3"
        />
      )}

      {f?.summary && <p className="opacity-90 mb-2">{f.summary}</p>}
      {f?.body && typeof f.body === 'string' && (
        <p className="opacity-90 mb-2">{f.body}</p>
      )}
      {f?.text && <p className="opacity-90 mb-2">{f.text}</p>}

      {ctaLabel && ctaUrl && (
        <div className="mt-4">
          <a
            className="inline-block rounded-xl px-4 py-2 border"
            href={ctaUrl}
          >
            {ctaLabel}
          </a>
        </div>
      )}
    </article>
  );
}
