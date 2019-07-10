export function addClasses(
  classified: Map<string, string[]>,
  dom: Document = document
) {
  for (const [query, classNames] of classified.entries()) {
    dom
      .querySelectorAll(query)
      .forEach(elem => elem.classList.add(...classNames));
  }
}

export function classify(
  strings: TemplateStringsArray,
  ...values: string[]
): Map<string, string[]> {
  const dirty = strings.reduce(
    (prev, next, i) => `${prev}${next}${values[i] || ""}`,
    ""
  );
  const isNotEmpty = (str: string) => str.length > 0;
  const trim = (str: string) => str.trim();
  const splitted = dirty
    .split("\n")
    .join(" ")
    .split("(")
    .flatMap((str: string) => str.trim().split(")"))
    .filter(isNotEmpty);
  if (splitted.length % 2 !== 0) {
    throw new Error("Classify: Wrong parenthesis");
  }
  return new Map(
    splitted.reduce((accum, val, i) => {
      const cleaned = val
        .split(" ")
        .map(trim)
        .filter(isNotEmpty)
        .join(" ");
      if (i % 2 === 0) {
        // query
        accum.push([cleaned]);
      } else {
        // classnames
        const classes = cleaned
          .split(" ")
          .map(trim)
          .filter(isNotEmpty);
        accum[accum.length - 1].push(classes);
      }
      return accum;
    }, [])
  );
}

/*
  return (classify`.asdf #:fdsaf (
md nd 123nn
 na
)
.ff section ( boom)

.ffaa ( ffffooo )
`);
})();
*/
