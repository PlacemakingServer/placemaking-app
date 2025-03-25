import Head from "next/head";

export default function PrivateLayout({ children, pageName }) {
  return (
    <>
      <Head>
        <title>{pageName ? `${pageName}` : "Área Logada"}</title>
      </Head>
      <main className="min-h-screen bg-gray-100">
        {children}
      </main>
    </>
  );
}
