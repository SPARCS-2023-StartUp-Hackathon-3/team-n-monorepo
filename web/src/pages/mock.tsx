import { type NextPage } from "next";
import Head from "next/head";

const Mock: NextPage = () => {
  return (
    <>
      <Head>
        <title>MOCK - NooN</title>
        <meta name="description" content="MOCK" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className="container">MOCK</div>
      </main>
      <style jsx>{`
        .container {
          color: red;
        }
      `}</style>
    </>
  );
};

export default Mock;