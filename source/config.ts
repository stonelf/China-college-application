export interface Major {
  college: string;
  major: string;
  batch: string;
  division: string;
  score: number;
}

export const userID =
  localStorage.userID ||
  (localStorage.userID = Math.round(Math.random() * 2 ** 48).toString(16));

export const baseURL = "https://stone.sou.ac.cn/release/CEE/";

export function ping(path = "") {
  document.querySelector("#ping")?.remove();

  const script = document.createElement("script");

  return new Promise((resolve, reject) => {
    script.id = "ping";
    script.onload = resolve;
    script.onerror = reject;
    script.src =
      new URL(
        path,
        `https://service-806yjs9u-1251042283.gz.apigw.tencentcs.com/release/log/${userID}/`
      ) + "";

    document.head.append(script);
  });
}
