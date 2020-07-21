import { ping } from "./data/config";

document.addEventListener("DOMContentLoaded", () => {
  const navbarCollapse = document.querySelector<HTMLDivElement>(
    ".navbar-collapse"
  );

  document.querySelector<HTMLButtonElement>(".navbar-toggler").onclick = () =>
    navbarCollapse.classList.toggle("show");

  navbarCollapse.onclick = (event) => {
    const item = (event.target as HTMLElement).closest(".nav-item");

    if (!item || !item.querySelector("a").href.startsWith("http")) return;

    navbarCollapse.querySelector(".nav-item.active").classList.remove("active");
    item.classList.add("active");

    navbarCollapse.classList.remove("show");
  };

  document.body.onclick = ({ target }) => {
    if (!(target as Element).matches(`.navbar *`))
      navbarCollapse.classList.remove("show");
  };
  (window.frames[0].frameElement as HTMLIFrameElement).onload = () =>
    (window.frames[0].onclick = document.body.onclick);

  // ping();
});
/**
 * 加载 PWA 后台线程
 */
if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.ts");
