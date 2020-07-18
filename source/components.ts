const spawn = document.createElement("template");

export function parseDOM(raw: string) {
  spawn.innerHTML = raw;

  return spawn.content;
}

export interface Props {
  className?: string;
  id?: string;
  title?: string;
  children?: string;
}

export interface FieldProps extends Props {
  name?: string;
  defaultValue?: string;
}

export function createRenderer<T extends Props = Props>(template: string) {
  return new Function("props", `with (props) return \`${template}\`;`) as (
    props: T
  ) => string;
}

export const SelectField = createRenderer<FieldProps & { label?: string }>(
  document.querySelector("#select-field").innerHTML
);
