import { classify } from "./utils";

// TODO: a template theme
// recursively searches for the parent element of type 'name'
function parentName(elem: Element, name: string): Element {
  if (elem.nodeName === name || elem.nodeName === "BODY") return elem;
  return parentName(elem.parentElement, name);
}

function meander(theme: MeanderTheme) {
  const dom = document;
  dom.addEventListener("DOMContentLoaded", (e: Event) => {
    const sectionTitles: string[] = [];
    const sectionElements: Element[] = [];
    dom.querySelectorAll("#meander section h1").forEach(elem => {
      const parent = parentName(elem, "SECTION");
      // insert the parent and its title if not already there
      if (sectionElements.indexOf(parent) === -1) {
        sectionElements.push(parent);
        sectionTitles.push(elem.textContent);
      }
    });
    console.log(sectionTitles, sectionElements);
  });
}
