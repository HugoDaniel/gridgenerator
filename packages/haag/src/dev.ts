import { addClasses, classify } from "./classify";
import { init } from "./loops";

export function runIt() {
  document.addEventListener("DOMContentLoaded", (e: Event) => {
    addClasses(classify`
      section (bg-red)
      section:last-of-type (bg-blue center b)
    `);
    init();
  });
}
