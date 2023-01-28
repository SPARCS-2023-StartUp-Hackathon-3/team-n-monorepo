import { type NextPage } from "next";
import Head from "next/head";

import Image from "next/image";
import useAuth from "../hooks/useAuth";
import { api } from "../utils/api";
import { useEffect, useState } from "react";
import useSWR from "swr";
import Link from "next/link";

export interface AnsweredQuestion {
  id: number;
  url: string;
  answer: string;
}
export const QUESTIONS_KEY = "/answeredQuestions";

const Questions: NextPage = () => {
  const { uuid, nickname } = useAuth();

  // 문제
  const { data: question } = api.question.randomQuestion.useQuery(
    { userUuid: uuid ?? "" },
    {
      refetchOnWindowFocus: false,
    }
  );
  const sum =
    question?.options?.reduce((prev, option) => prev + option.submitCount, 1) ??
    1;

  // 출제자가 고른 정답
  const [answerId, setAnswerId] = useState<null | number>(null);

  // 제출
  const mutation = api.question.submitAnswer.useMutation();
  useEffect(() => {
    if (question && answerId) {
      mutation.mutate({
        questionId: question.id,
        optionId: answerId,
        userUuid: uuid!,
      });
    }
  }, [question, answerId]);

  return (
    <>
      <Head>
        <title>문제 - NooN</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Link href="/inspect">임시 링크</Link>
        <Image
          priority
          src="/logo.png"
          alt="NooN logo"
          width={327}
          height={93}
        />
        <p>
          {nickname}님, 반갑습니다! 온라인 쇼핑몰에서 이미지를 볼 수 없는 분들을
          위해 왼쪽 사진의 아이템을 제가 대신 설명하려고 해요. 사람들이 가장
          많이 고른 선택지를 맞춰 주세요!
        </p>
        <p>000점</p>

        {question && (
          <>
            <Image
              priority
              src={question.url}
              alt="MOCK"
              width={320}
              height={280}
              style={{ objectFit: "contain" }}
            />
            {question.options.map((option, index) => (
              <div
                className="box"
                key={option.id}
                onClick={() => setAnswerId(option.id)}
              >
                <span className="text">{option.text}</span>
                <span className="number">{index + 1}</span>
                <span
                  className="percent"
                  style={{
                    transform: `scaleX(${
                      answerId
                        ? (option.submitCount +
                            (answerId === option.id ? 1 : 0)) /
                          sum
                        : 0
                    })`,
                  }}
                />
              </div>
            ))}
          </>
        )}
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
      `}</style>
    </>
  );
};

export default Questions;
