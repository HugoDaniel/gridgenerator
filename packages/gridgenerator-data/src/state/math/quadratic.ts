// Solve a quadratic equation a * x * x + b * x + c = 0 using numerical stable method.
// Returns an array of root values.
// - if a !== 0
//   - an array of length 2 if d > 0 where d = b * b - 4 * a * c
//   - an array of length 1 if d === 0
//   - an empty array if d < 0
// - if a === 0 (linear equation)
//   - an array of length 1 if b !== 0
//   - an array of length 3 if b === 0 and c === 0 (trivial equation)
//   - an empty array if b === 0 and c !== 0
// See http://people.csail.mit.edu/bkph/articles/Quadratics.pdf
export function solveQuadraticEquation(
  a: number,
  b: number,
  c: number
): Array<number | undefined> {
  const d = b * b - 4 * a * c;
  let ds;
  let mbmds;
  let mbpds;
  if (a === 0) {
    // linear equation
    if (b === 0) {
      if (c === 0) {
        // all values of x are ok.
        return [undefined, undefined, undefined];
      } else {
        return [];
      }
    } else {
      return [-c / b];
    }
  }
  if (d < 0) {
    return [];
  } else if (d === 0) {
    return [-b / (2 * a)];
  }
  ds = Math.sqrt(d);
  if (b >= 0) {
    mbmds = -b - ds;
    return [mbmds / (2 * a), (2 * c) / mbmds];
  } else {
    mbpds = -b + ds;
    return [(2 * c) / mbpds, mbpds / (2 * a)];
  }
}
