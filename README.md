# Trigger redeploy

# Contentful Next.js Demo (App Router)

Minimal-Demo zur Visualisierung von Änderungen aus Contentful.
- Next.js App Router
- TailwindCSS
- Contentful CDA/CPA (Preview-Schalter)

## Setup

1. Abhängigkeiten installieren:
   ```bash
   npm install
   ```

2. `.env.local` anlegen (siehe `.env.example`).

3. Dev-Server starten:
   ```bash
   npm run dev
   ```

4. Contentful Content Types gemäß Anleitung:
   - Page: title, slug, blocks (References -> Banner, Teaser, RichTextBlock)
   - Banner: headline, subline, image, ctaLabel, ctaUrl
   - Teaser: title, image, summary, url
   - RichTextBlock: body (Rich Text)

5. Lege eine Page mit slug `home` an und referenziere Banner/Teaser/RichTextBlock.

## Preview

- `NEXT_PUBLIC_ENABLE_PREVIEW=true` in `.env.local` aktiviert Preview (CPA).
- In Live (`false`) werden nur publizierte Inhalte (CDA) angezeigt.

## Deployment

- Vercel: Projekt importieren, Environment Variablen setzen, deployen.
