import { createClient } from 'contentful';

const space = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!;
const environment = process.env.CONTENTFUL_ENVIRONMENT || 'master';

const cdaToken = process.env.CONTENTFUL_CDA_TOKEN!;
const cpaToken = process.env.CONTENTFUL_CPA_TOKEN!;

export const getClient = (preview = false) =>
  createClient({
    space,
    environment,
    accessToken: preview ? cpaToken : cdaToken,
    host: preview ? 'preview.contentful.com' : 'cdn.contentful.com',
  });
