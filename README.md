# Background Remover

Pet photo background remover MVP built with Next.js and Tailwind CSS.

## Local development

1. Copy `.env.example` to `.env.local`
2. Set `REMOVE_BG_API_KEY`
3. Run `npm run dev`

## Cloudflare deployment

1. Push this repository to GitHub
2. In Cloudflare, go to `Workers & Pages`
3. Choose `Create` -> `Import a repository`
4. Select this repository
5. Add the production secret `REMOVE_BG_API_KEY`
6. Deploy with the default OpenNext scripts from this repo

### Useful commands

- `npm run preview`: Build for Cloudflare and preview locally with Wrangler
- `npm run deploy`: Build and deploy to Cloudflare Workers
- `npm run upload`: Upload the built worker bundle
- `npm run cf-typegen`: Generate Wrangler environment types

## Core features

- Single image upload for pet photos
- Drag-and-drop or click upload
- remove.bg server-side proxy
- Transparent PNG preview and download
- No image storage
- Basic FAQ and privacy messaging

## Main route

- `GET /`
- `POST /api/remove-background`
