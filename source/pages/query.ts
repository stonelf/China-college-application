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
  scoreInput = document.querySelector<HTMLInputElement>("#score"),
  positionInput = document.querySelector<HTMLInputElement>("#position");

function switchMode(type: string) {
  if (type === "s") {
    scoreInput.disabled = scoreInput.parentElement.hidden = false;
    positionInput.disabled = positionInput.parentElement.hidden = true;
  } else {
    scoreInput.disabled = scoreInput.parentElement.hidden = true;
    positionInput.disabled = positionInput.parentElement.hidden = false;
  }
  filterForm.hidden = true;
  resultBox.innerHTML = "";
}

document.querySelector<HTMLSelectElement>("#search_by").onchange = ({
  target,
}) => switchMode((target as HTMLSelectElement).value);
/**
 * 输入缓存
 */
for (const input of queryForm.elements) {
  const { name } = input as HTMLInputElement;
  const value = self.localStorage[name];

  if (!value) continue;

  (input as HTMLInputElement).value = value;

  if (name === "search_by") switchMode(value);
}

queryForm.onchange = ({ target }) => {
  const { name, value } = target as HTMLInputElement;

  self.localStorage[name] = value;
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

  const {
      province,
      division,
      percent,
      score,
      position,
      search_by,
    } = Object.fromEntries(
      Array.from(
        queryForm.elements,
        ({ name, disabled, value }: HTMLInputElement) => [
          name,
          !disabled && value,
        ]
      )
    ),
    button = queryForm.querySelector("button");

  const path = [
    province,
    division,
    percent,
    score || position,
    search_by,
    self.localStorage.moreData == 1 ? "list.js" : "data.js",
  ].join("/");

  ping(path);

  button.disabled = true;

  const response = await fetch(new URL(path, baseURL) + "");

  const list: Major[] = await response.json(),
    scoreKey: string = search_by + percent;

  const two_columns = +percent !== 50;

  data = list
    .map(
      ({ [scoreKey]: score, s50, p50, ...rest }) =>
        ({
          score: two_columns ? s50 || p50 : score,
          position: two_columns ? score : "",
          dimension: searchBy[search_by].slice(1),
          percent: +percent,
          ...rest,
        } as Major)
    )
    .sort(({ position: A, score: C }, { position: B, score: D }) =>
      search_by === "s" ? B - A || D - C : A - B || C - D
    );

  renderAll();

  button.disabled = filterForm.hidden = false;
  (filterForm.elements[0] as HTMLInputElement).value = "";
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
