// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        {/* Vincula ao manifest.json */}
        <link rel="manifest" href="/manifest.json" />
        {/* Define cores para a barra de endereço em mobile */}
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Exemplo de PWA com Next.js e Supabase" />
        {/* Ícones para diferentes plataformas (opcional). Você pode repetir as meta tags de ícone se desejar */}
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
