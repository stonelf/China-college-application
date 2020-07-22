import { parseDOM, SelectField, createRenderer } from "./components";
import { province, division, searchBy } from "../data/meta.json";
import { Major, ping, baseURL } from "../data/config";
/**
 * 渲染表单项
 */
const { 0: queryForm, 1: filterForm } = document.forms;

queryForm.prepend(
  parseDOM(`
    ${SelectField({
      className: "col-6 col-sm-4",
      id: "province",
      name: "province",
      label: "省份",
      children: province
        .map((name, index) => `<option value="${index}">${name}</option>`)
        .join(""),
    })}

    ${SelectField({
      className: "col-6 col-sm-4",
      id: "division",
      name: "division",
      label: "分科",
      children: division
        .map((text, index) => `<option value="${index}">${text}</option>`)
        .join(""),
    })}

    ${SelectField({
      className: "col-6 col-sm-4",
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
const resultBox = document.querySelector("body > main"),
  scoreLabel = document.querySelector('label[for="score"]');

document.querySelector<HTMLSelectElement>("#search_by").onchange = ({
  target,
}) => {
  const { value } = target as HTMLSelectElement;

  scoreLabel.textContent = searchBy[value].slice(1);

  filterForm.hidden = true;
  resultBox.innerHTML = "";
};
/**
 * 查询、渲染数据
 */
const ResultCard = createRenderer<Major>(
  resultBox.nextElementSibling.innerHTML
);

var data: Major[] = [];

function renderAll() {
  resultBox.innerHTML = data.map(ResultCard).join("");
}

queryForm.onsubmit = async (event) => {
  event.preventDefault();

  const { province, division, percent, score, search_by } = Object.fromEntries(
      Array.from(queryForm.elements, ({ name, value }: HTMLInputElement) => [
        name,
        value,
      ])
    ),
    button = queryForm.querySelector("button");

  const path = [province, division, percent, score, search_by, "data.js"].join(
    "/"
  );
  ping(path);

  button.disabled = true;

  const response = await fetch(new URL(path, baseURL) + "");

  const list: Major[] = await response.json(),
    scoreKey: string = search_by + percent;

  const two_columns = +percent !== 50;

  data = list.map(({ [scoreKey]: score, s50, p50, ...rest }) => ({
    score: two_columns ? s50 || p50 : score,
    position: two_columns ? score : "",
    dimension: searchBy[search_by].slice(1),
    percent: +percent,
    ...rest,
  })) as Major[];

  renderAll();

  button.disabled = filterForm.hidden = false;
};
/**
 * 筛选数据
 */
const inAttr = /^[^<]*>/;

filterForm.onsubmit = (event) => {
  event.preventDefault();

  const { value } = (event.target as HTMLFormElement)
    .elements[0] as HTMLInputElement;

  if (!value.trim()) return renderAll();

  const keywords = new RegExp(value.replace(/\s+/g, "|"), "g");

  resultBox.innerHTML = data
    .filter(({ college, major }) => keywords.test(`${college} ${major}`))
    .map((item) =>
      ResultCard(item).replace(keywords, (match, offset: number, raw: string) =>
        inAttr.test(raw.slice(offset))
          ? match
          : `<span class="text-danger">${match}</span>`
      )
    )
    .join("");
};
