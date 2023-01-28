chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.contentScriptQuery === "/image/alt") {
    fetch("https://team-n-web.vercel.app/api/image/alt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        urls: request.urls,
        experimental: true,
      }),
    }).then((response) => {
      response.json().then((res) => {
        sendResponse(res.data);
      });
    });
    return true;
  }
});
