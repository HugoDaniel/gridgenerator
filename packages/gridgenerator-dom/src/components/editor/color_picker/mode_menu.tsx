import { linkEvent } from "inferno";
import { Menu, UIFillEditorColorMode } from "gridgenerator-data";

export interface IModeMenuProps {
  className?: string;
  isVertical: boolean;
  menu: Menu<UIFillEditorColorMode>;
  onAction: (id: UIFillEditorColorMode) => void;
}
export function ModeMenu(props: IModeMenuProps) {
  return (
    <nav className={`ModeMenu ${props.className || ""}`}>
      {props.menu.map((id, e, isSelected) => (
        <button
          onClick={linkEvent(id, props.onAction)}
          className={`h3 pointer bg-transparent bn pa0 ma0 w3 ${
            isSelected ? "bottom-circle" : "hover-color"
          }`}
        >
          <img src={e.iconUrl} alt={`${id}`} className={"w2"} />
          <p className={"sans-serif f7 black ma0 pa0"}>{e.label}</p>
        </button>
      ))}
    </nav>
  );
}
