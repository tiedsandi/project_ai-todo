import "@/styles/globals.css";

import type { AppProps } from "next/app";
import Head from "next/head";
import Header from "../components/Header";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Roadmind | AI Blog Planner</title>
        <meta name="description" content="Plan your learning journey with AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Component {...pageProps} />
        </main>
      </div>
    </>
  );
}
