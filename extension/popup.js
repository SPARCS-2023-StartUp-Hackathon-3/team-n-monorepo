/**
 * TODO
 * - DOMSubtreeModified도 가능하면 1초 정도 이미지를 배열에 모았다가 sendMessage 하는게 나을듯..? threshold는 개발해가며 정해야할 듯.
 * - DOMSubtreeModified는 권장하지 않으므로 MutationObserver로 바꿀 수 있으면 바꾸기
 */

const allResults = {}; // { url: alt }

function callAPI(imageNodes) {
  // API 요청할 이미지 url 추출
  const urls = imageNodes
    .filter(
      (node) => !node.hasAttribute("alt") && allResults[node.src] === undefined
    )
    .map((node) => node.src);

  if (urls.length === 0) return;

  // API 요청
  chrome.runtime.sendMessage(
    { contentScriptQuery: "/image/alt", urls },
    (newAlts) => {
      // API 결과를 allResults 객체에 저장
      newAlts.forEach((newAlt) => {
        allResults[newAlt.url] = newAlt.alt;
      });

      // API 결과를 img alt에 반영
      imageNodes.forEach((node) => {
        const targetAlt = allResults[node.src];
        if (targetAlt !== undefined) {
          node.setAttribute("alt", targetAlt);
        }
      });
    }
  );
}

/**
// 1. 주기적으로 감지할 대상 요소 선정
const target = document;

// 2. 옵저버 콜백 생성
const callback = (mutationList) => {
  console.log(mutationList);
};

// 3. 옵저버 인스턴스 생성
const observer = new MutationObserver(callback); // 타겟에 변화가 일어나면 콜백함수를 실행하게 된다.

// 4. DOM의 어떤 부분을 감시할지를 옵션 설정
const config = {
  attributes: true, // 속성 변화 할때 감지
  childList: true, // 자식노드 추가/제거 감지
  characterData: true, // 데이터 변경전 내용 기록
};

// 5. 감지 시작
observer.observe(target, config);

// 6. 감지 중지
observer.disconnect();
 */

// page 처음 진입
let initialImages = document.getElementsByTagName("img");
callAPI([...initialImages]);

// DOMSubtreeModified마다 새로 API call 후 새로 fill
document.addEventListener("DOMSubtreeModified", (e) => {
  if (e.target.tagName === "IMG") {
    callAPI([e.target]);
  }
});

// Listen for messages from the popup.
chrome.runtime.onMessage.addListener((msg, sender, response) => {
  if (msg.from === "popup" && msg.subject === "DOMInfo") {
    const count = Object.keys(allResults).length;
    response(count);
  }
});
