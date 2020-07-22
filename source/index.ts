import { ping } from "./data/config";

document.addEventListener("DOMContentLoaded", () => {
  const navbarCollapse = document.querySelector<HTMLDivElement>(
      ".navbar-collapse"
    ),
    navbarToggler = document.querySelector<HTMLButtonElement>(
      ".navbar-toggler"
    );
  /**
   * 导航栏外部开合
   */
  navbarToggler.onclick = () => {
    const expanded = navbarCollapse.classList.contains("show");

    navbarToggler.setAttribute("aria-expanded", !expanded + "");
    navbarCollapse.classList.toggle("show");
    if (!expanded) navbarCollapse.parentElement.focus();
  };

  navbarCollapse.parentElement.onblur = () =>
    setTimeout(() => {
      navbarToggler.setAttribute("aria-expanded", "false");
      navbarCollapse.classList.remove("show");
    }, 300);
  /**
   * 导航项目点击切换
   */
  navbarCollapse.onclick = (event) => {
    const item = (event.target as HTMLElement).closest(".nav-item");

    if (!item || !item.querySelector("a").href.startsWith("http")) return;

    navbarCollapse.querySelector(".nav-item.active").classList.remove("active");
    item.classList.add("active");
  };
  /**
   * 导航项目加载切换
   */
  const navItems = document.querySelectorAll(".nav-item");

  document.querySelector("iframe").onload = () => {
    try {
      var { href } = window.frames[0].location;
    } catch {
      return;
    }

    for (const { firstElementChild: link, classList } of navItems)
      classList.toggle("active", (link as HTMLAnchorElement).href === href);
  };
  /**
   * 访问统计
   */
  ping();
});
/**
 * 加载 PWA 后台线程
 */
if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.ts");
