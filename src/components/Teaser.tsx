export default function Teaser({ data }: { data: any }) {
  const { title, image, summary, url } = data?.fields || {};
  const img = image?.fields?.file?.url ? `https:${image.fields.file.url}` : undefined;
  return (
    <article className="card">
      {img && (<img src={img} alt={title || ''} className="w-full h-48 object-cover rounded-xl mb-3" />)}
      <h3 className="text-xl font-medium mb-1">{title}</h3>
      {summary && <p className="opacity-80 mb-3">{summary}</p>}
      {url && <a href={url} className="underline">Mehr erfahren</a>}
    </article>
  );
}
