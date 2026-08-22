This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# ContractorsApp

## Subida de fotos a S3 (`/contractors/invoice`)

Las fotos del formulario de facturas van directo del navegador a S3 con una
URL prefirmada: `getPresignedUrl` (`src/actions/s3Actions.ts`) firma una URL
de 60 s y el navegador hace el `PUT`. Los bytes no pasan por el servidor de
Next y las credenciales de AWS no salen del runtime de Node. El formulario
solo guarda las URLs públicas, que se persisten en la tabla `media` al
enviar.

Variables de entorno necesarias (`.env`):

```env
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-2
AWS_BUCKET_NAME=contractorsapp-bucket
```

La configuración del bucket (lectura pública, CORS y política IAM mínima)
está en [`aws/README.md`](./aws/README.md) — **sin el CORS aplicado, el PUT
desde el navegador falla con 403**.
