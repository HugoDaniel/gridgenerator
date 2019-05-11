import { linkEvent } from "inferno";
import { Menu } from "gridgenerator-data";
export interface IMeanderMenuProps<T> {
  className?: string;
  menu: Menu<T>;
  onAction: (option: T, e?: Event) => void;
}
export const MeanderMenu = (props: IMeanderMenuProps<any>) => {
  return (
    <header className="bg-meander black-80 tc pt0 avenir">
      <nav className="f6 f5-l bb b--light-gray tc mw7 center">
        {props.menu.map((key, entry, isSelected) => (
          <a
            className={`f6 f5-l link pointer bg-animate black-80 ${
              isSelected ? "b" : ""
            } hover-bg-${entry.iconUrl} dib pa3 ph4-l`}
            onClick={linkEvent(key, props.onAction)}
          >
            {entry.label}
          </a>
        ))}
      </nav>
    </header>
  );
};
