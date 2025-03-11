// Exemplo em _document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="pt-BR">
        <Head>
          {/* Link para o manifest.json */}
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#000000" />
          {/* Ícone para barra do navegador */}
          <link rel="icon" href="/favicon.ico" />
          {/* Metatags adicionais... */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
