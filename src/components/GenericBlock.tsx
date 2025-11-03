'use client';

import { BLOCKS, INLINES, Document } from '@contentful/rich-text-types';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

export default function GenericBlock({ entry }: { entry: any }) {
  const ct = entry?.sys?.contentType?.sys?.id;
  const f = entry?.fields || {};

  const image =
    f.image?.fields?.file?.url ||
    f.backgroundImage?.fields?.file?.url ||
    f.media?.fields?.file?.url ||
    undefined;
  const imgUrl = image ? (image.startsWith('http') ? image : `https:${image}`) : undefined;

  const rich: Document | undefined = f.body || f.content || f.richText || undefined;
  const title = f.title || f.heading || f.headline || f.internalName || f.pageName || '';
  const subtitle = f.subline || f.subheading || f.eyebrow || '';

  const ctaLabel = f.ctaLabel || f.ctaText || '';
  const ctaUrl = f.ctaUrl || f.ctaLink || f.url || '';

  if (ct === 'componentHeroBanner') {
  return (
    <section className="col-span-full rounded-2xl p-0 shadow border"> {/* volle Breite */}
      {imgUrl && (
        <img
          src={imgUrl}
          alt={title}
          className="w-full h-96 md:h-[480px] object-cover rounded-2xl"
        />
      )}
      <div className="p-6">
        <h2 className="text-3xl md:text-4xl font-semibold mb-2">{title}</h2>
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


  if (ct === 'componentTextBlock' && rich) {
    return (
      <article className="rounded-2xl p-6 shadow border prose max-w-none">
        {documentToReactComponents(rich, {
          renderNode: {
            [INLINES.HYPERLINK]: (node, children) => (
              <a href={(node.data as any).uri} className="underline">{children}</a>
            ),
            [BLOCKS.EMBEDDED_ASSET]: () => null,
          },
        })}
      </article>
    );
  }

  return (
    <article className="rounded-2xl p-6 shadow border">
      <h3 className="text-xl font-medium mb-2">{title || ct}</h3>
      {imgUrl && <img src={imgUrl} alt={title} className="w-full h-48 object-cover rounded-xl mb-3" />}
      {rich && (
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
      )}
      {!rich && (f.summary || f.teaser) && <p className="opacity-80">{f.summary || f.teaser}</p>}
    </article>
  );
}
