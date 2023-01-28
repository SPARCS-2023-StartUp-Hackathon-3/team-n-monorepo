import { type NextPage } from "next";
import Head from "next/head";
import Carousel from "../foundations/Carousel";
import Link from "next/link";
import useSWR from "swr";
import { type AnsweredQuestion, QUESTIONS_KEY } from "./questions";

const Inspect: NextPage = () => {
  const { data: questions } = useSWR<AnsweredQuestion[]>(QUESTIONS_KEY);
  console.log(questions);

  return (
    <>
      <Head>
        <title>검수 - NooN</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Link href="/score">임시 링크</Link>
        <p>
          오늘 본 패션을 00님이 더 잘 읽을 수 있다면 고쳐주세요! 수정을 마친
          대체텍스트는 엔터를 눌러 옷장에 넣을 수 있어요.
        </p>
        <div className="carouselWrapper">
          {questions && (
            <Carousel
              fullWidth={833}
              fullHeight={650}
              items={new Array(9).fill(null).map((_, i) => {
                const option = questions[i % questions.length];
                return (
                  <div className="mock" key={i}>
                    <img
                      className="image"
                      src={option?.url || ""}
                      alt={option?.correctAnswer || ""}
                      width={500}
                      height={500}
                    />
                  </div>
                );
              })}
              emitCurrentIndex={(index) => {
                console.log(index);
              }}
            />
          )}
        </div>
      </main>
      <style jsx>{`
        .carouselWrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;

          max-width: 1000px;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .mock {
          width: 500px;
          height: 500px;
          background: black;
          border-radius: 10px;
        }
        .image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          user-select: none;
          -webkit-user-drag: none;
          border-radius: 10px;
        }
      `}</style>
    </>
  );
};

export default Inspect;
