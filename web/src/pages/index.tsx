import { type NextPage } from "next";
import Head from "next/head";
import { api } from "../utils/api";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/router";
import useAuth from "../hooks/useAuth";

const Home: NextPage = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  const router = useRouter();
  const [nickname, setNickname] = useState("");

  /*const [trigger, setTrigger] = useState(false);*/

  const { generateUser } = useAuth();
  const handleSubmit = () => {
    const refinedNickname = nickname.trim();
    if (refinedNickname.length === 0) return;

    generateUser(refinedNickname);
    void router.push("/questions");
  };

  return (
    <>
      <Head>
        <title>NooN</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        
        <div className="area" >
          <ul className="circles">
            <li></li>
            <li></li>
            <li></li>
          </ul>
          <div className="backgroundImg1">
            <Image
                  priority
                  src="/main1.png"
                  alt=""
                  width={323}
                  height={503}
            />
          </div>
          <div className="backgroundImg2">
            <Image
                  priority
                  src="/main2.png"
                  alt=""
                  width={312}
                  height={328}
            />
          </div>
          <div className="backgroundImg3">
            <Image
                  priority
                  src="/main3.png"
                  alt=""
                  width={280}
                  height={298}
            />
          </div>

          <div className="middle">
            <div className="ranking">
              <ul>
                <li>1등 닉네임닉 00벌</li>
                <li>2등 닉네임닉 00벌</li>
                <li>3등 닉네임닉 00벌</li>
                <li>4등 닉네임닉 00벌</li>
              </ul>
            </div>
            <div className="impact">
              <p>총 000벌을 읽었어요!</p>
            </div>
            <div className="imgAlign">
              <Image
                priority
                src="/logo.png"
                alt="NooN 로고"
                width={382}
                height={122}
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
            <p className="p1">패션을 들려주는 새로운 눈</p>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <input
                id="nickname"
                name="nickname"
                placeholder="닉네임을 입력하세요"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                }}
              />
              <p className="p2">더 많은 사람들이 선택한 대체텍스트*를 찾아 보세요!</p>
              <button>시작하기</button>
            </form>
          </div>
          <div className="right">
            <a href="www.google.com">NooN 확장 프로그램 써 보러 가기</a>
          </div>
        
        </div >

      </main>
      <style jsx>{`
          body {
            background-color: white;
            background-image: src("/main1.png")
            font-family: "SCoreDream";
            font-style: normal;
          }
          .middle {
            text-align: center;
            color: #FFFFFF;
            mix-blend-mode: difference;
          }
          .right {
            position: absolute;
            bottom: 0;
            right: 0;
            margin: 15px;
          }
          .ranking {
            margin-bottom: 50px;
          }
          .impact {
            font-weight: 600;
            font-size: 30px;
            line-height: 36px;
            margin: 20px;
          }
          .imgAlign {
            display: flex;
            justify-content: center;
            mix-blend-mode: difference;
          }
          .subTitle {
            display: flex;
            justify-content: center;
            margin: 10px;
          }
          .p1{
            font-weight: 300;
            font-size: 20px;
            line-height: 24px;
            margin: 40px;
          }
          .p2{
            font-weight: 300;
            font-size: 15px;
            line-height: 18px;
            margin: 15px;
          }
          button{
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;

            font-weight: 700;
            font-size: 30px;
            line-height: 38px;

            background: #FFFFFF;
            color: #000000;
            margin: 0;
            padding: 25px 140px;
            display: inline-block;
            width: auto;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            transition: 0.5s;
          }

          /** background css */
          .backgroundImg1{
            position: absolute;
            left: 0px;
            top: 0px;
          }
          .backgroundImg2{
            position: absolute;
            right: 140px;
            top: 15px;
          }
          .backgroundImg3{
            position: absolute;
            left: 222px;
            bottom: 0px;
          }

          .area {
            z-index: -2;
            padding: 50px;
            width: 100%;
            height: 100%;
          }

          .circles {
            z-index: -1;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }

          .circles li {
            position: absolute;
            display: block;
            list-style: none;
            background: rgba(234, 238, 38, 0.9);
            animation: animate 25s infinite ease-in;
            bottom: -150px;
          }

          .circles li:nth-child(1) {
            left: 140%;
            width: 1547px;
            height: 1400px;
            transform: rotate(45deg);
            animation-delay: 0s;
            animation-duration: 45s;
          }

          .circles li:nth-child(2) {
            left: 10%;
            width: 800px;
            height: 700px;
            animation-duration: 35s;
          }

          .circles li:nth-child(3) {
            left: -10%;
            width: 500px;
            height: 400px;
            animation-duration: 23s;
          }

          @keyframes animate {
            0% {
              top: -1000px;
              left: -500px;
              transform: rotate(0deg);
              opacity: 1;
              border-radius: 50%;
            }
            50% {
              top: 200px;
              left: 50px;
              transform: rotate(360deg);
              opacity: 0.5;
              border-radius: 100%;
            }
            100% {
              top: -1000px;
              left: -500px;
              transform: rotate(720deg);
              opacity: 1;
              border-radius: 80%;
            }
          }
        `}
      </style>
    </>
  );
};

export default Home;
