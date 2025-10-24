import { BLOCKS, INLINES, Document } from '@contentful/rich-text-types';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

export default function RichTextBlock({ data }: { data: any }) {
  const body: Document | undefined = data?.fields?.body;
  if (!body) return null;
  return (
    <div className="prose max-w-none">
      {documentToReactComponents(body, {
        renderNode: {
          [INLINES.HYPERLINK]: (node, children) => (
            <a href={(node.data as any).uri} className="underline">{children}</a>
          ),
          [BLOCKS.EMBEDDED_ASSET]: () => null,
        },
      })}
    </div>
  );
}
