import { type NextPage } from "next";
import Head from "next/head";
import { api } from "../utils/api";

const Mock: NextPage = () => {
  const mutation = api.question.submitAnswer.useMutation();

  function triggerMutation() {
    mutation.mutate({
      questionId: 1,
      optionId: 4,
      userUuid: "32033077-fd0f-452f-bbcf-c4e67cf84ca7",
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
          color: green;
        }
      `}</style>
    </>
  );
};

export default Mock;
