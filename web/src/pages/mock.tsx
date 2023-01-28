import { type NextPage } from "next";
import Head from "next/head";
import { api } from "../utils/api";

const Mock: NextPage = () => {
  const mutation = api.question.submitAnswer.useMutation();

  function triggerMutation() {
    mutation.mutate({
      questionId: 1,
      optionId: 1,
      userUuid: "d7f7f7f7-f7f7-f7f7-f7f7-f7f7f7f7f7f7",
    });
  }
  return (
    <>
      <Head>
        <title>MOCK - NooN</title>
        <meta name="description" content="MOCK" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className="container">MOCK</div>
        <button onClick={triggerMutation}>Trigger mutation</button>
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
