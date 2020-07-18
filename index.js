import { parseDOM, SelectField, createRenderer } from "./source/components";
import { province, division, search_by } from "./source/meta.json";

document.forms[0].prepend(
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

const tbody = document.querySelector("#majorList"),
  userID =
    localStorage.userID ||
    (localStorage.userID = Math.round(Math.random() * 2 ** 48).toString(16));

const baseURL = "//stone.sou.ac.cn/release/CEE",
  pingpath =
    "https://service-806yjs9u-1251042283.gz.apigw.tencentcs.com/release/log/" +
    userID;

document.querySelector("#ping").src = pingpath;

const TableRow = createRenderer(tbody.firstElementChild.innerHTML);

document.forms[0].addEventListener("submit", async (event) => {
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

  fetch(new URL(path, pingpath));

  const response = await fetch(new URL(path, baseURL));

  const list = await response.json(),
    scoreKey = search_by.value + percent.value;

  tbody.innerHTML = list
    .map(({ [scoreKey]: score, ...rest }) => ({ score, ...rest }))
    .map(TableRow)
    .join("");
});

document.querySelector("#tip").addEventListener("click", () => {
  document.querySelector("dialog").showModal();
});

var data = [],
  searchBy;

function $(id) {
  return document.getElementById(id);
}

function filter() {
  var kw = $("keywordBox").value.replace(/\s/, "");
  if (kw.length < 1) return;
  var r = new RegExp("(" + kw + ")");
  var e = $("majorList"),
    tr,
    p = $("percentSelector").value;
  $("majorList").innerHTML = "";
  for (var i = 0; i < data.length; i++) {
    if (r.test(data[i].college + data[i].major + data[i].subMajor)) {
      tr = e.insertRow();
      tr.insertCell().innerHTML = (
        data[i].college +
        "<wbr>" +
        data[i].branch
      ).replace(r, "<font color=red>$1</font>");
      tr.insertCell().innerHTML = (
        data[i].major +
        "<wbr>" +
        data[i].subMajor
      ).replace(r, "<font color=red>$1</font>");
      tr.insertCell().innerHTML = data[i].batch;
      tr.insertCell().innerHTML = data[i].division;
      tr.insertCell().innerHTML = data[i][searchBy + 50];
      if (p != 50) tr.insertCell().innerHTML = data[i][searchBy + p];
    }
  }
}
