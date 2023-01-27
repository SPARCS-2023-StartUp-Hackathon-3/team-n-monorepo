/**
 * TODO
 * 1. background.js에 있는 urls를 payload를 하드 코딩에서 실제 img src 배열로 변겅
 * 2. 이미지마다 모두 API를 호출하면 안되고, 배열에 모아두었다가 sendMessage는 한 번만 해야한다!!
 * 3. DOMSubtreeModified도 가능하면 1초 정도 이미지를 배열에 모았다가 sendMessage 하는게 나을듯..? threshold는 개발해가며 정해야할 듯.
 * +. DOMSubtreeModified는 권장하지 않으므로 MutationObserver로 바꿀 수 있으면 바꾸기
 */


let urlArr = []; // page의 모든 url Array
let urlArrFlag = false;
let recievedArr = []; // API call 후 받은 Array [{url,alt}]

function makeUrlArr(imgNode) {
  if(!urlArrFlag) {
    urlArr = [];
    urlArrFlag = true;
  } else{
    urlArr.push(imgNode.src);
  }
}

function callAPI(sendingArr, imgNodeArr) {
  chrome.runtime.sendMessage(
    { contentScriptQuery: "/image/alt", urls: sendingArr},
    (res) => {
      console.log(imgNodeArr);
      recievedArr = res;
      for(let i = 0; i < imgNodeArr.length; i++){
        fillAlt(imgNodeArr[i]);
      }
      console.log("content-script: ", recievedArr);
    },
  );
}


function fillAlt(imgNode) {
  let altText = "";
  //console.log(recievedArr);
  for(let i = 0, j = recievedArr.length; i < j; i++) {
    //console.log(recievedArr[i].alt);
    if(imgNode.src === recievedArr[i].url) {
      imgNode.setAttribute("alt", recievedArr[i].alt);
      break;
    }
  }
  console.log(imgNode.alt);
}


// Listen for messages from the popup.
chrome.runtime.onMessage.addListener((msg, sender, response) => {
  if (msg.from === "popup" && msg.subject === "DOMInfo") {
    const count = 13; // TODO: alt 변경한 이미지 배열의 길이로 바꾸기
    response(count);
  }
});

// Listen for messages from the popup.
chrome.runtime.onMessage.addListener((msg, sender, response) => {
  if (msg.from === "popup" && msg.subject === "DOMInfo") {
    const count = 13; // TODO: alt 변경한 이미지 배열의 길이로 바꾸기
    response(count);
  }
});

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
let checkImgs = document.getElementsByTagName("img");
console.log(checkImgs);
new Array(...checkImgs).forEach(makeUrlArr);
callAPI(urlArr, checkImgs);
//new Array(...checkImgs).forEach(fillAlt);

// DOMSubtreeModified마다 새로 API call 후 새로 fill
document.addEventListener("DOMSubtreeModified", (e) => { 
  urlArrFlag = false;
  if (e.target.tagName === "IMG") {
    makeUrlArr(e.target);
    callAPI(urlArr, e.target);
    //fillAlt(e.target);
  }
});
