import Head from "next/head";

export default function PublicLayout({ children, pageName }) {
  return (
    <>
      <Head>
        <title>{pageName ? `${pageName}` : "Minha Aplicação"}</title>
      </Head>
      <main className="min-h-screen bg-white">
        {children}
      </main>
    </>
  );
}
