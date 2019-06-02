"use strict";
const dom = document;
function parentName(elem: Element, name: string): Element {
  if (elem.nodeName === name || elem.nodeName === "BODY") return elem;
  return parentName(elem.parentElement, name);
}
dom.addEventListener("DOMContentLoaded", (e: Event) => {
  const sectionTitles: string[] = [];
  const sectionElements: Element[] = [];
  dom.querySelectorAll("#meander section h1").forEach(elem => {
    const parent = parentName(elem, "SECTION");
    if (sectionElements.indexOf(parent) === -1) {
      sectionElements.push(parent);
      sectionTitles.push(elem.textContent);
    }
    console.log(sectionTitles, sectionElements);
  });
});

console.log("YEAH");
