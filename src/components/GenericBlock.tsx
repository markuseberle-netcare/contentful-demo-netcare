'use client';

import { BLOCKS, INLINES, Document } from '@contentful/rich-text-types';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

export default function GenericBlock({ entry }: { entry: any }) {
  const ct: string | undefined = entry?.sys?.contentType?.sys?.id;
  const f: any = entry?.fields || {};

  // Bild-URL heuristisch ermitteln
  const image =
    f?.image?.fields?.file?.url ||
    f?.backgroundImage?.fields?.file?.url ||
    f?.media?.fields?.file?.url ||
    undefined;
  const imgUrl = image ? (image.startsWith('http') ? image : `https:${image}`) : undefined;

  // Rich-Text-Feld heuristisch ermitteln
  const rich: Document | undefined = f?.body || f?.content || f?.richText || undefined;

  // Basistexte
  const title: string =
    f?.title || f?.heading || f?.headline || f?.internalName || f?.pageName || '';
  const subtitle: string = f?.subline || f?.subheading || f?.eyebrow || '';

  // CTA (optional)
  const ctaLabel: string | undefined = f?.ctaLabel || f?.ctaText || undefined;
  const ctaUrl: string | undefined = f?.ctaUrl || f?.ctaLink || f?.url || undefined;

  // ===========================
  // Spezifischer Render: Hero
  // ===========================
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

  // =======================================
  // Spezifischer Render: TextBlock (Rich)
  // =======================================
  if (ct === 'componentTextBlock' && rich) {
    return (
      <article className="rounded-2xl p-6 shadow border prose max-w-none">
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
      </article>
    );
  }

  // =======================================
  // Generischer Fallback (z. B. Teaser/Wissensblöcke)
  // - zeigt Titel, Bild und Body (Rich oder Plain)
  // =======================================
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

      {/* Bodytext (Rich Text oder Plain Text-Felder) */}
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
        <>
          {f?.summary && <p className="opacity-90 mb-2">{f.summary}</p>}
          {f?.body && typeof f.body === 'string' && (
            <p className="opacity-90 mb-2">{f.body}</p>
          )}
          {f?.teaser && <p className="opacity-90 mb-2">{f.teaser}</p>}
          {f?.text && <p className="opacity-90 mb-2">{f.text}</p>}
        </>
      )}

      {/* Optional: CTA auch im Fallback anzeigen */}
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
