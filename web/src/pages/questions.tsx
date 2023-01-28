import { type NextPage } from "next";
import Head from "next/head";

import Image from "next/image";
import useAuth from "../hooks/useAuth";
import { api } from "../utils/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import { mutate } from "swr";
import { inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "../server/api/root";
import { useRouter } from "next/router";

export type Option =
  inferRouterOutputs<AppRouter>["question"]["randomQuestion"]["options"][0];
export interface AnsweredQuestion {
  id: number;
  url: string;
  correctAnswer: string;
}
export const QUESTIONS_KEY = "/answeredQuestions";

const Questions: NextPage = () => {
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

  // 출제자가 고른 정답
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
          }, 1000);
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

  return (
    <>
      <Head>
        <title>문제 - NooN</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Link href="/inspect">임시 링크</Link>

        <div className="area" >
          <ul className="circles">
            <li></li>
            <li></li>
            <li></li>
          </ul>
          <div className="imgAlign">
            <Image
              priority
              src="/logo_questions.png"
              alt="NooN logo"
              width={237}
              height={168}
            />
          </div>
          <p>
            {nickname}님, 반갑습니다! 온라인 쇼핑몰에서 이미지를 볼 수 없는 분들을
            위해 왼쪽 사진의 아이템을 제가 대신 설명하려고 해요. 사람들이 가장
            많이 고른 선택지를 맞춰 주세요!
          </p>
          <p>000점</p>

          {question && (
            <>
              <img
                src={question.url}
                alt="secret"
                width={320}
                height={280}
                style={{ objectFit: "contain" }}
              />
              {options.map((option, index) => (
                <div
                  className="box"
                  key={option.id}
                  onClick={() => setAnswer(option)}
                >
                  <span className="text">{option.text}</span>
                  <span className="number">{index + 1}</span>
                  <span
                    className="percent"
                    style={{
                      transform: `scaleX(${
                        answer
                          ? (option.submitCount +
                              (answer.id === option.id ? 1 : 0)) /
                            sum
                          : 0
                      })`,
                    }}
                  />
                </div>
              ))}
            </>
          )}
        
        </div>
      </main>
      <style jsx>{`
        .box {
          position: relative;
          max-width: 340px;
          min-height: 50px;
          padding: 20px;

          background: #ffffff;
          border: 1px solid #000000;
          border-radius: 10px;
        }
        .text {
          position: relative;
          color: white;
          mix-blend-mode: difference;
          z-index: 1;
        }
        .number {
          position: absolute;
          top: 0;
          left: 0;
          width: 19px;
          height: 22px;
          border-radius: 8.5px 0 6px;
          z-index: 1;

          color: black;
          mix-blend-mode: difference;
          background: white;
          background-blend-mode: difference;
        }
        .percent {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 10px;

          transition: transform 1s;
          background-color: black;
          transform-origin: left;
        }
        .imgAlign {
            display: flex;
            justify-content: center;
            mix-blend-mode: difference;
          }
      `}</style>
    </>
  );
};

export default Questions;