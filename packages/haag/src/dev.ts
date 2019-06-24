import { addClasses, classify } from "./classify";

export function runIt() {
  document.addEventListener("DOMContentLoaded", (e: Event) => {
    addClasses(classify`
      section (bg-red)
      section:last-of-type (bg-blue center b)
    `);
  });
}
