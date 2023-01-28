import { type NextPage } from "next";
import Head from "next/head";
import { api } from "../utils/api";
import useAuth from "../hooks/useAuth";
import { useRouter } from "next/router";
import Image from "next/image";
import { useEffect } from "react";
import { mutate } from "swr";
import { QUESTIONS_KEY } from "./questions";

const Score: NextPage = () => {
  const { data: ranking } = api.ranking.get.useQuery();
  const { retryUser, uuid, nickname } = useAuth();
  const me = ranking?.find((ele) => ele.userUuid === uuid);

  const router = useRouter();
  const retry = () => {
    retryUser();
    void router.push("/questions");
  };

  // 초기화
  useEffect(() => {
    void mutate(QUESTIONS_KEY, []);
  }, []);

  return (
    <>
      <Head>
        <title>점수 - NooN</title>
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
          <p className="p1">
            {nickname}님, 총 {me?.score}벌
          </p>
          <p className="p2">
            {ranking?.length}명 중에 {me?.rank}등!
          </p>
          <div className="imgAlign">
            <Image
              priority
              src="/logo_wink.gif"
              alt="NooN logo"
              width={449}
              height={300}
            />
          </div>
          <div className="subTitle">
            <Image
              priority
              src="/sublogo.png"
              alt="for Fashion"
              width={207}
              height={99}
            />
          </div>
          <p className="p3">
            {nickname}님 덕분에 NooN이 패션을 더 잘 들려줄 수 있게 되었어요
            <br></br>감사해요 :)
          </p>
          <div className="bottonWrapper">
            <button onClick={retry}>다시 시작하기</button>
          </div>
        </div>
      </main>
      <style jsx>{`
        button {
          border: 1px solid black;
        }
        .imgAlign {
          display: flex;
          justify-content: center;
          mix-blend-mode: difference;
          margin: -16px 0 -64px;
        }
        .subTitle {
          display: flex;
          justify-content: center;
          mix-blend-mode: difference;
          margin-bottom: 64px;
        }
        .p1 {
          font-weight: 500;
          font-size: 30px;
          line-height: 36px;
          margin-top: 64px;
          text-align: center;
        }
        .p2 {
          font-weight: 800;
          font-size: 40px;
          line-height: 48px;
          margin-top: 13px;
          text-align: center;
        }
        .p3 {
          font-weight: 300;
          font-size: 25px;
          line-height: 30px;
          text-align: center;
          margin-bottom: 32px;
        }
        button {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;

          font-weight: 700;
          font-size: 30px;
          line-height: 38px;

          background: #000000;
          color: #ffffff;
          padding: 25px 140px;
          display: inline-block;
          width: auto;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: 0.5s;
        }
        .bottonWrapper {
          color: black;
          justify-content: center;
          text-align: center;
        }
      `}</style>
    </>
  );
};

export default Score;
