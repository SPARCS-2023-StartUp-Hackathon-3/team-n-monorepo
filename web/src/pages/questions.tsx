import { type NextPage } from "next";
import Head from "next/head";

import Image from "next/image";
import useAuth from "../hooks/useAuth";
import { api } from "../utils/api";
import { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import { inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "../server/api/root";
import { useRouter } from "next/router";
import { Alert, Snackbar } from "@mui/material";

export type Option =
  inferRouterOutputs<AppRouter>["question"]["randomQuestion"]["options"][0];
export interface AnsweredQuestion {
  id: number;
  url: string;
  correctAnswer: string;
}
export const QUESTIONS_KEY = "/answeredQuestions";

const Questions: NextPage = () => {
  const { data: answeredQuestions } = useSWR<AnsweredQuestion[]>(QUESTIONS_KEY);
  const router = useRouter();
  const { uuid, nickname } = useAuth();

  // 문제
  const { data: question, refetch } = api.question.randomQuestion.useQuery(
    { userUuid: uuid ?? "" },
    {
      refetchOnWindowFocus: false,
    }
  );

  const options = question?.options ?? [];
  const countOfCorrectAnswer = Math.max(
    ...options.map((option) => option.submitCount)
  );
  const correctAnswer = options.find(
    (option) => option.submitCount === countOfCorrectAnswer
  );

  const sum = options.reduce((prev, option) => prev + option.submitCount, 1);

  // 내가 고른 정답
  const [answer, setAnswer] = useState<Option | null>(null);

  // 제출
  const mutation = api.question.submitAnswer.useMutation({
    onSuccess: () => {
      if (question && answer && correctAnswer) {
        if (countOfCorrectAnswer === answer.submitCount) {
          // 정답
          void mutate<AnsweredQuestion[]>(QUESTIONS_KEY, (state) => [
            ...(state ?? []),
            {
              id: question.id,
              url: question.url,
              correctAnswer: answer.text,
            },
          ]);
          setTimeout(() => {
            setAnswer(null);
            void refetch();
          }, 1000);
        } else {
          // 오답
          void mutate<AnsweredQuestion[]>(QUESTIONS_KEY, (state) => [
            ...(state ?? []),
            {
              id: question.id,
              url: question.url,
              correctAnswer: correctAnswer.text,
            },
          ]);
          setTimeout(() => {
            void router.push("/inspect");
          }, 2000);
        }
      }
    },
    onError: () => {
      void router.push("/inspect");
    },
  });
  useEffect(() => {
    if (question && answer && correctAnswer) {
      // api 호출
      mutation.mutate({
        questionId: question.id,
        optionId: answer.id,
        userUuid: uuid!,
        nickname: nickname!,
      });
    }
  }, [question, answer, correctAnswer]);

  // 초기화
  useEffect(() => {
    void mutate(QUESTIONS_KEY, []);
  }, []);

  const isWrong =
    question && answer && countOfCorrectAnswer !== answer?.submitCount;

  // toast
  const vertical = "top";
  const horizontal = "center";

  return (
    <>
      <Head>
        <title>문제 - NooN</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        key={vertical + horizontal}
        open={!!isWrong}
      >
        <Alert severity="warning">
          연속 득점 실패! 다음 화면으로 이동합니다.
        </Alert>
      </Snackbar>
      <main>
        <div className="area">
          <ul className="circles">
            <li></li>
            <li></li>
            <li></li>
          </ul>

          <p className="backgroundScore"> {answeredQuestions?.length} </p>
          <div className="imgAlign">
            <Image
              priority
              src="/logo_questions.png"
              alt="NooN logo"
              width={237}
              height={168}
            />
          </div>

          <div className="guide">
            {isWrong ? (
              <p>
                {nickname}님, 다른 사람들은 아무래도 보는 눈이 다른가 봐요!
                <br />
                대체텍스트를 쓸 때는 이미지에 있는 정보만 적어야 한다는 점 잊지
                마세요.
              </p>
            ) : answeredQuestions?.length === 0 ? (
              <p>
                {nickname}님, 반갑습니다!
                <br></br>쇼핑몰에서 이미지를 볼 수 없는 분들께 제가 아래
                이미지를 설명하려고 해요.
                <br></br>어떤 설명이 제일 괜찮나요? 사람들이 가장 많이 고른
                선택지를 맞혀주세요!
              </p>
            ) : (
              <p>
                {nickname}님, 고마워요! 다른 아이템도 한 번 살펴볼까요?
                <br></br>
                {answeredQuestions && answeredQuestions.length % 2 === 0 ? (
                  <>
                    어떤 설명이 제일 괜찮나요? 사람들이 가장 많이 고른 선택지를
                    맞혀주세요!
                  </>
                ) : (
                  <>
                    대체텍스트에 &apos;~사진&apos;, &apos;~이미지&apos; 같은
                    말은 필요 없다는 점 참고하세요!
                  </>
                )}
              </p>
            )}
          </div>

          {question && (
            <div className="question">
              <div className="imgBox">
                <img
                  src={question.url}
                  alt="secret"
                  width={470}
                  height={280}
                  style={{ objectFit: "contain" }}
                />
              </div>

              <ol>
                {options.map((option, index) => (
                  <li
                    className="box"
                    data-disabled={!!answer ? "true" : "false"}
                    key={option.id}
                    onClick={() => {
                      if (!answer) {
                        setAnswer(option);
                      }
                    }}
                  >
                    <span className="text">{option.text}</span>
                    {answer?.id !== option.id && (
                      <span className="number">{index + 1}</span>
                    )}
                    {answer?.id === option.id && (
                      <span className="answerNum">{index + 1}</span>
                    )}
                    <span
                      className="percent"
                      style={{
                        transition: answer ? "transform 1s" : "transform 1000s",
                        transform: `scaleX(${
                          answer
                            ? (option.submitCount +
                                (answer.id === option.id ? 1 : 0)) /
                              sum
                            : 0
                        })`,
                      }}
                    />
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </main>
      <style jsx>{`
        main {
          padding-top: 44px;
        }
        .header {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 64px;
        }
        .guide {
          text-align: center;
          color: #000000;
          font-size: 20px;
          min-height: 100px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .question {
          margin-top: 32px;
          display: flex;
          gap: 20px;
          justify-content: center;
          align-items: flex-start;
        }
        .box {
          position: relative;
          width: 630px;
          min-height: 90px;
          padding: 36px;
          margin-bottom: 20px;

          background: #ffffff;
          border: 1px solid #000000;
          border-radius: 10px;
        }
        .box:hover:not(.box[data-disabled="true"]) {
          position: relative;
          width: 630px;
          min-height: 90px;
          padding: 36px;
          margin-bottom: 20px;

          font-weight: 700;

          background: #ffffff;
          border: 2px solid #000000;
          border-radius: 10px;
        }
        .text {
          position: relative;
          left: 80px;
          color: white;
          mix-blend-mode: difference;
          z-index: 1;
        }
        .number {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          left: 32px;
          width: 30px;
          height: 30px;
          z-index: 1;
          text-align: center;

          font-weight: 900;
          font-size: 30px;
          line-height: 36px;

          color: white;
          mix-blend-mode: difference;
        }
        .answerNum {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          left: 24px;
          width: 46px;
          height: 46px;
          z-index: 1;
          text-align: center;
          border-radius: 23px;
          line-height: 170%;

          font-weight: 900;
          font-size: 30px;

          background: white;
          mix-blend-mode: difference;
        }
        .percent {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 10px;
          background-color: black;
          transform-origin: left;
        }
        .imgAlign {
          display: flex;
          justify-content: center;
          mix-blend-mode: difference;
        }
        .backgroundScore {
          z-index: -1;
          position: absolute;
          right: 0;
          top: 777.87px;

          font-weight: 300;
          font-size: 656px;
          line-height: 0;

          display: flex;
          align-items: center;
          letter-spacing: -0.1em;

          color: #9b9b9b;

          mix-blend-mode: difference;
          transform: rotate(-23.74deg);
        }
      `}</style>
    </>
  );
};

export default Questions;
