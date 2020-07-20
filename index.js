import { parseDOM, SelectField, createRenderer } from "./source/components";
import { province, division, search_by } from "./source/meta.json";
import { ping, baseURL } from "./source/config";

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
      children: Object.entries(search_by)
        .map(([value, name]) => `<option value="${value}">${name}</option>`)
        .join(""),
    })}
`)
);

queryForm.elements.search_by.onchange = ({ target: { value } }) => {
  const type = search_by[value].slice(1);

  document.querySelector('label[for="score"]').textContent = type;
  document.querySelector("th:nth-child(5)").textContent = `预测${type}`;
};

const tbody = document.querySelector("#majorList");

const TableRow = createRenderer(tbody.firstElementChild.innerHTML);

var data = [];

function renderAll() {
  tbody.innerHTML = data.map(TableRow).join("");
}

queryForm.onsubmit = async (event) => {
  event.preventDefault();

  const {
    elements: { province, division, percent, score, search_by },
  } = event.target;

  const path = [
    province.value,
    division.value,
    percent.value,
    score.value,
    search_by.value,
    "data.js",
  ].join("/");

  ping(path);

  const response = await fetch(new URL(path, baseURL) + "");

  const list = await response.json(),
    scoreKey = search_by.value + percent.value;

  data = list.map(({ [scoreKey]: score, ...rest }) => ({ score, ...rest }));

  renderAll();

  filterForm.hidden = false;
};

filterForm.onsubmit = (event) => {
  event.preventDefault();

  const {
    elements: {
      0: { value },
    },
  } = event.target;

  if (!value.trim()) return renderAll();

  const keywords = new RegExp(value.replace(/\s+/g, "|"), "g");

  tbody.innerHTML = data
    .filter(({ college, major }) => keywords.test(`${college} ${major}`))
    .map((item) =>
      TableRow(item).replace(keywords, '<span class="text-danger">$&</span>')
    )
    .join("");
};

document.querySelector("#tip").addEventListener("click", () => {
  document.querySelector("dialog").showModal();
});

ping();
