// NOTE: 오늘까지 쌓인 눈송이
fetch("https://team-n-web.vercel.app/api/noon/count", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
}).then((response) => {
  response.json().then((res) => {
    document.getElementById("count").innerText = String(res.count);
  });
});

// NOTE: 이 페이지에서 생성한 대체텍스트
window.addEventListener("load", () => {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { from: "popup", subject: "DOMInfo" },
        (count) => {
          document.getElementById("count2").innerText = String(count);
        }
      );
    }
  );
});
