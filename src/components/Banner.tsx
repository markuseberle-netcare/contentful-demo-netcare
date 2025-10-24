export default function Banner({ data }: { data: any }) {
  const { headline, subline, image, ctaLabel, ctaUrl } = data?.fields || {};
  const img = image?.fields?.file?.url ? `https:${image.fields.file.url}` : undefined;
  return (
    <section className="card p-8">
      {img && (<img src={img} alt={headline || ''} className="w-full h-64 object-cover rounded-xl mb-4" />)}
      <h2 className="text-3xl font-semibold mb-2">{headline}</h2>
      {subline && <p className="text-lg mb-4 opacity-80">{subline}</p>}
      {ctaLabel && ctaUrl && (
        <a href={ctaUrl} className="inline-block rounded-2xl px-4 py-2 border">{ctaLabel}</a>
      )}
    </section>
  );
}
