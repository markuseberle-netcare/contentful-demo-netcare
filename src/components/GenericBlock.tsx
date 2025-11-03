// ============ DUPLEX (Bild + Text nebeneinander, mit Bodytext) ============
if (ct === 'componentDuplex') {
  const body: Document | undefined = f?.bodyText; // direktes Rich Text Feld
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

        {/* ✅ Hier kommt jetzt der echte Bodytext */}
        {body ? (
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

        {ctaLabel && ctaUrl && (
          <div className="mt-4">
