// 현재 페이지에서 NooN 대체 텍스트를 사용한 모든 결과
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

// page 처음 진입
let initialImages = document.getElementsByTagName("img");
callAPI([...initialImages]);

// page 업데이트 감지
setTimeout(() => {
  // 옵저버 콜백 생성
  const callback = (mutationList) => {
    mutationList.forEach((mutation) => {
      const target = mutation.target;
      if (target.tagName === "IMG") {
        callAPI([target]);
      }
    });
  };
  // 옵저버 인스턴스 생성
  const observer = new MutationObserver(callback); // 타겟에 변화가 일어나면 콜백함수를 실행하게 된다.
  // DOM의 어떤 부분을 감시할지를 옵션 설정
  const config = {
    attributes: true, // 속성 변화 할때 감지
    childList: true, // 자식노드 추가/제거 감지
    subtree: true, // subtree 감지
  };
  // observe
  observer.observe(document, config);
}, 3000);

// Listen for messages from the popup.
chrome.runtime.onMessage.addListener((msg, sender, response) => {
  if (msg.from === "popup" && msg.subject === "DOMInfo") {
    const count = Object.keys(allResults).length;
    response(count);
  }
});
