import { parseDOM, SelectField, createRenderer, Props } from "./components";
import { province, division, searchBy } from "./meta.json";
import { Major, ping, baseURL } from "./config";

type MajorProps = Major & Props;
/**
 * 渲染表单项
 */
const { 0: queryForm, 1: filterForm } = document.forms;

queryForm.prepend(
  parseDOM(`
    ${SelectField({
      className: "col-12 col-12 col-sm-6 col-md-4",
      id: "province",
      name: "province",
      label: "省份",
      children: province
        .map((name, index) => `<option value="${index}">${name}</option>`)
        .join(""),
    })}

    ${SelectField({
      className: "col-12 col-12 col-sm-6 col-md-4",
      id: "division",
      name: "division",
      label: "分科",
      children: division
        .map((text, index) => `<option value="${index}">${text}</option>`)
        .join(""),
    })}

    ${SelectField({
      className: "col-12 col-12 col-sm-6 col-md-4",
      id: "search_by",
      name: "search_by",
      label: "查询方式",
      children: Object.entries(searchBy)
        .map(([value, name]) => `<option value="${value}">${name}</option>`)
        .join(""),
    })}
`)
);
/**
 * 分数、位次切换
 */
const tbody = document.querySelector("#majorList");

document.querySelector<HTMLSelectElement>("#search_by").onchange = ({
  target,
}) => {
  const { value } = target as HTMLSelectElement;
  const type = searchBy[value].slice(1);

  document.querySelector('label[for="score"]').textContent = type;
  document.querySelector("th:nth-child(5)").textContent = `预测${type}`;

  tbody.innerHTML = "";
};
/**
 * 查询、渲染表格
 */
const TableRow = createRenderer(tbody.firstElementChild.innerHTML),
  lastColumn = document.querySelector<HTMLTableHeaderCellElement>(
    "th:last-child"
  );

var data: MajorProps[] = [];

function renderAll() {
  tbody.innerHTML = data.map(TableRow).join("");
}

queryForm.onsubmit = async (event) => {
  event.preventDefault();

  const {
    // @ts-ignore
    elements: { province, division, percent, score, search_by },
  } = event.target as HTMLFormElement;

  const path = [
    province.value,
    division.value,
    percent.value,
    score.value,
    search_by.value,
    "data.js",
  ].join("/");

  // ping(path);

  const response = await fetch(new URL(path, baseURL) + "");

  const list: MajorProps[] = await response.json(),
    scoreKey: string = search_by.value + percent.value;

  const two_columns = !scoreKey.endsWith("50");

  data = list.map(({ [scoreKey]: score, s50, p50, ...rest }) => ({
    score: two_columns ? s50 || p50 : score,
    position: two_columns ? score : "",
    ...rest,
  })) as MajorProps[];

  lastColumn.innerHTML = two_columns
    ? `预测${searchBy[scoreKey[0]].slice(1)}<br>（${percent.value}%概率过线）`
    : "";

  renderAll();

  filterForm.hidden = false;
};
/**
 * 筛选表格
 */
filterForm.onsubmit = (event) => {
  event.preventDefault();

  const { value } = (event.target as HTMLFormElement)
    .elements[0] as HTMLInputElement;

  if (!value.trim()) return renderAll();

  const keywords = new RegExp(value.replace(/\s+/g, "|"), "g");

  tbody.innerHTML = data
    .filter(({ college, major }) => keywords.test(`${college} ${major}`))
    .map((item) =>
      TableRow(item).replace(keywords, '<span class="text-danger">$&</span>')
    )
    .join("");
};
/**
 * 打开捐款弹框
 */
document
  .querySelector("#tip")
  .addEventListener("click", () =>
    document.querySelector("dialog").showModal()
  );
/**
 * 访问统计
 */
// ping();
/**
 * 加载 PWA 后台线程
 */
if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.ts");
