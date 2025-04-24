import "@/styles/globals.css";
import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { LoadingContextProvider, useLoading } from "@/context/LoadingContext";
import { MessageProvider } from "@/context/MessageContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Loading from "@/components/ui/Loading";
import { initBackgroundSync } from "@/utils/periodicSync";
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
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/img/icon-512x512.png"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
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
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
          console.log('SW registrado com sucesso!');
          if (!navigator.serviceWorker.controller) {
            sessionStorage.setItem('sw-activated', '1');
            window.location.reload();
          } else {
            initBackgroundSync();
          }
        })
        .catch(console.error);
    }
  }, []);

  

  return (
    <AuthProvider>
      <LoadingContextProvider>
        <MessageProvider>
          <AppContent Component={Component} pageProps={pageProps} />
        </MessageProvider>
      </LoadingContextProvider>
    </AuthProvider>
  );
}

export default MyApp;
