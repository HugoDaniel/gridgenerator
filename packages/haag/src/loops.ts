class LoopOf extends HTMLTemplateElement {
  public elements: WeakSet<HTMLElement>;
  public render() {
    const clone = document.importNode(this.content, true);
    const test = document.createElement("div");
    test.innerHTML = value;
    this.parentNode.appendChild(test);
  }
  constructor() {
    super();
    console.log("LOOP OF()", this);
    // Get Parent
    const loopParent = this.parentNode;
    this.elements = new WeakSet();
    this.render = (data: any) => 
  }
}

export function init() {
  customElements.define("loop-of", LoopOf, { extends: "template" });
  // customElements.define("word-count", WordCount, { extends: "p" });
}

// Create a class for the element
// tslint:disable-next-line: max-classes-per-file
class WordCount extends HTMLParagraphElement {
  constructor() {
    // Always call super first in constructor
    super();

    // count words in element's parent element
    var wcParent = this.parentNode;
    console.log("PARENT", this, wcParent);

    function countWords(node) {
      var text = node.innerText || node.textContent;
      return text.split(/\s+/g).length;
    }

    var count = "Words: " + countWords(wcParent);

    // Create a shadow root
    var shadow = this.attachShadow({ mode: "open" });

    // Create text node and add word count to it
    var text = document.createElement("span");
    text.textContent = count;

    // Append it to the shadow root
    shadow.appendChild(text);

    // Update count when element content changes
    setInterval(function() {
      var count = "Words: " + countWords(wcParent);
      text.textContent = count;
    }, 200);
  }
}
