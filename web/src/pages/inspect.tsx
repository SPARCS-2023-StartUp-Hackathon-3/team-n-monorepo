import { type NextPage } from "next";
import Head from "next/head";
import Carousel from "../foundations/Carousel";
import Link from "next/link";
import useSWR from "swr";
import { type AnsweredQuestion, QUESTIONS_KEY } from "./questions";
import useAuth from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { api } from "../utils/api";
import { useRouter } from "next/router";
import Image from "next/image";

const Inspect: NextPage = () => {
  const { uuid, nickname } = useAuth();
  const { data: questions } = useSWR<AnsweredQuestion[]>(QUESTIONS_KEY);

  const [inspectedQuestions, setInspectedQuestions] = useState<
    AnsweredQuestion[]
  >([]);
  const [currentQuestion, setCurrentQuestion] =
    useState<AnsweredQuestion | null>(null);

  const inspected = inspectedQuestions
    .map((q) => q.id)
    .includes(Number(currentQuestion?.id));

  const [text, setText] = useState("");
  useEffect(() => {
    if (currentQuestion) {
      setText(currentQuestion.correctAnswer);
    }
  }, [currentQuestion]);

  const mutation = api.question.addOption.useMutation();
  const submit = () => {
    if (uuid && currentQuestion) {
      mutation.mutate({
        userUuid: uuid,
        questionId: currentQuestion.id,
        text,
      });
      setInspectedQuestions((state) => [...state, currentQuestion]);
    }
  };

  // 검수 완료
  const router = useRouter();
  useEffect(() => {
    if (questions && inspectedQuestions) {
      if (questions.length === inspectedQuestions.length) {
        void router.push("/score");
      }
    }
  }, [inspectedQuestions, questions, router]);

  useEffect(() => {
    if (questions && questions.length === 0) {
      void router.push("/");
    }
  }, [questions, router]);

  return (
    <>
      <Head>
        <title>검수 - NooN</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className="area">
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

          <div className="question">
            <p>
              직접 보지 않고 글만 읽어도 어떤 상품인지 알 수 있을 것 같다면
              옷장에 담아주세요.
              <br></br>혹시 방금 본 아이템들 중 설명이 부적절한 대체텍스트는
              없었나요?
              <br></br>옷장에 담기 전,{nickname}님이 직접 수정해 볼 수 있어요!
            </p>
          </div>
          <div className="bottomeWrapper">
            <div className="carouselWrapper">
              {questions && (
                <Carousel
                  fullWidth={750}
                  fullHeight={334}
                  items={new Array(9).fill(null).map((_, i) => {
                    const question = questions[i % questions.length];
                    return (
                      <img
                        className="image"
                        src={question?.url || ""}
                        alt={question?.correctAnswer || ""}
                        width={500}
                        height={500}
                        key={i}
                        style={{
                          opacity: inspectedQuestions
                            .map((q) => q.id)
                            .includes(Number(question?.id))
                            ? 0.1
                            : 1,
                        }}
                      />
                    );
                  })}
                  emitCurrentIndex={(index) => {
                    setCurrentQuestion(questions[index % questions.length]!);
                  }}
                />
              )}
              <textarea
                className="input"
                maxLength={125}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                }}
                disabled={inspected}
                style={{
                  opacity: inspected ? 0.5 : 1,
                  pointerEvents: inspected ? "none" : "auto",
                }}
              />
              <button onClick={submit}>옷장에 집어넣기</button>
            </div>
          </div>
          <div className="nextWrapper">
            <div className="nextButton">
              <Link href="/score">넘어 가기</Link>
            </div>
          </div>
        </div>
      </main>
      <style jsx>{`
        .carouselWrapper {
          position: relative;
          justify-content: center;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;

          max-width: 80%;
          width: 100%;
          height: 100%;
          overflow: hidden;
          margin: auto;
          text-align: center;
        }
        .bottomWrapper {
          display: inline-block;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: auto:
        }
        .image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          user-select: none;
          -webkit-user-drag: none;
          border-radius: 10px;
        }
        .input {
          z-index: 100;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 400px;
          padding: 36px;

          background: rgba(255, 255, 255, 0.8);
          border: 1px solid #000000;
          border-radius: 10px;
          color: #7d7d7d;
          text-align: center;

          display: flex;
          align-items: center;

          white-space: pre-wrap;
          word-break: break-all;
          overflow: hidden;
          resize: none;
        }
        .imgAlign {
          display: flex;
          justify-content: center;
          mix-blend-mode: difference;
        }
        .question {
          text-align: center;
          color: #000000;
        }
        button {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;

          font-weight: 700;
          font-size: 30px;
          line-height: 36px;

          background: #000000;
          color: #FFFFFF;
          padding: 25px 105px;
          display: inline-block;
          width: auto;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: 0.5s;
          margin-top: 100px;

          z-index: 1000;
        }
        .nextWrapper{
          display: flex;
          justify-content: center;
          width: 100%
          margin: auto;
        }
        .nextButton {
          font-weight: 500;
          font-size: 20px;
          line-height: 24px;
          text-align: center;
          margin: 15px;
          border-bottom: 2px solid;
          width: 7%;
        }
      `}</style>
    </>
  );
};

export default Inspect;
