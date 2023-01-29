# [TEAM N] team-n-monorepo

이 Repository는 "NooN 프로젝트"의 모든 코드를 포함한 Repository 입니다.

다음과 같은 기능이 포함되어 있습니다.

- `/extension`: 시각장애인에게 img alt text를 제공하는 Chrome Extension 관련 코드
- `/web`: 비장애인이 게임을 통해 img alt text 고도화에 기여할 수 있는 웹서비스 관련 코드
- `/ml`: 

## 프로젝트에서 사용한 기술

본 프로젝트에는 아래와 같은 기술들이 사용되었습니다.

- `/extension`
  - Chrome Extension 
  - HTML/CSS/JS
  - `service-worker`, `content-script`, `content.js` 사이의 message 통신
  - fetch API
- `/web`
  - T3 Stack
  - Next.js
  - SWR
  - eslint/prettier
  - uuid
  - MUI
- `/ml`
  - Python
  - Pytorch

## Dev Server 실행 방법

- `/extension`
  - `chrome://extensions/` 에 접속합니다.
  - **개발자 모드**를 켜고 `/extension` 폴더를 사이트에 로드합니다.
  - `NooN Chrome Extension`을 켜고 다른 웹사이트에 방문합니다.
- `/web`
  - .env를 채웁니다.
  - 아래의 코드를 실행합니다.
  ```
  cd web
  npm install
  npm run dev
  ```
- `ml`

## Production 배포 방법

- `/web`
  - github에 push하면 연결된 Vercel을 통해 자동으로 배포됩니다.
  - [NooN For Fashion](https://team-n-web.vercel.app/)

## 환경 변수 및 시크릿

- `/web`
  - `.env` 환경 변수 중 `DATABASE_URL` 값이 필요합니다.

## 기타

... 기타 설명이 필요한 사항들 ...
