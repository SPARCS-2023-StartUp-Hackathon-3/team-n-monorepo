import { type NextPage } from "next";
import Head from "next/head";
import { api } from "../utils/api";

const Mock: NextPage = () => {
  const mutation2 = api.question.addOption.useMutation();
  mutation2.mutate({
    userUuid: "",
    questionId: 11,
    text: "dsaf",
  });

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
          color: green;
        }
      `}</style>
    </>
  );
};

export default Mock;
