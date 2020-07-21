import { ping } from "./data/config";

document.addEventListener("DOMContentLoaded", () => {
  const navbarCollapse = document.querySelector<HTMLDivElement>(
    ".navbar-collapse"
  );

  document.querySelector<HTMLButtonElement>(".navbar-toggler").onclick = () => {
    navbarCollapse.classList.toggle("show");
    navbarCollapse.focus();
  };
  navbarCollapse.onblur = () =>
    setTimeout(() => navbarCollapse.classList.remove("show"));

  navbarCollapse.onclick = (event) => {
    const item = (event.target as HTMLElement).closest(".nav-item");

    if (!item || !item.querySelector("a").href.startsWith("http")) return;

    navbarCollapse.querySelector(".nav-item.active").classList.remove("active");
    item.classList.add("active");
  };

  // ping();
});
/**
 * 加载 PWA 后台线程
 */
if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.ts");
