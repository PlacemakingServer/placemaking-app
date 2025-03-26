// pages/_app.js
import "@/styles/globals.css";
import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { LoadingContextProvider, useLoading } from "@/context/loadingContext";
import { MessageProvider } from "@/context/messageContext";
import Loading from "@/components/ui/loading";
import { registerServiceWorker } from "@/services/registerServiceWorker";

import PublicLayout from "@/components/layouts/publicLayout";
import PrivateLayout from "@/components/layouts/privateLayout";

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
