// pages/_app.js
import "@/styles/globals.css";
import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { LoadingContextProvider, useLoading } from "@/context/LoadingContext";
import { MessageProvider } from "@/context/MessageContext";
import Loading from "@/components/ui/Loading";
import { registerServiceWorker } from "@/services/registerServiceWorker";

import PublicLayout from "@/components/layouts/PublicLayout";
import PrivateLayout from "@/components/layouts/PrivateLayout";

import Head from "next/head";

function AppContent({ Component, pageProps }) {
  const { isLoading } = useLoading();

  const PageComponent = Component;
  const pageName = PageComponent.pageName || "Minha Aplicação";
  const layoutType = PageComponent.layout || "public";

  const Layout = layoutType === "private" ? PrivateLayout : PublicLayout;

  return (
    <>
      <Head>
        <title>{`${pageName} | Minha Aplicação`}</title>
        <link rel="icon" type="image/png" sizes="512x512" href="/img/icon-512x512.png" />
        </Head>

      <Layout pageName={pageName}>
        <PageComponent {...pageProps} />
      </Layout>

      <AnimatePresence>{isLoading && <Loading />}</AnimatePresence>
    </>
  );
}

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <LoadingContextProvider>
      <MessageProvider>
        <AppContent Component={Component} pageProps={pageProps} />
      </MessageProvider>
    </LoadingContextProvider>
  );
}

export default MyApp;
