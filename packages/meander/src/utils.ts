type QueryString = string;
type ClassName = string;
export interface IMeanderTheme {
  classes: Map<QueryString, ClassName>;
  hidden: ClassName;
  visible: ClassName;
  loadingSection: QueryString | null;
}

const defaultTheme = {
  /** Array of pairs: [query string, classname] */
  classes: new Map([["#meander section", "teste1"]]),
  /** classname to append to hidden sections */
  hidden: "dn hidden",
  /** classname to append to the visible section */
  visible: "visible",
  loadingSection: "#meander section:last-of-type"
};

export interface IMeanderActions {
  startLoading: () => void;
  stopLoading: () => void;
}

export function applyTheme(
  theme: IMeanderTheme = defaultTheme
): IMeanderActions {
  for (const [query, className] of theme.classes) {
    // Split className
    // Use the element(s) classList functions to add the classes
  }
  return {
    startLoading() {
      console.log("Starting loading");
    },
    stopLoading() {
      console.log("Stoping loading");
    }
  };
}
