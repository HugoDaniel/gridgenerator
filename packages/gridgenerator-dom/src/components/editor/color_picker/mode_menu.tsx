// @ts-ignore
import picker_hering_icon from "../../../assets/icons/picker-hering.svg";
// @ts-ignore
import picker_lightness_icon from "../../../assets/icons/picker-lightness.svg";
// @ts-ignore
import picker_saturation_icon from "../../../assets/icons/picker-saturation.svg";

import { linkEvent } from "inferno";
import { Menu, UIFillEditorColorMode } from "gridgenerator-data";

export interface IModeMenuProps {
  className?: string;
  isVertical: boolean;
  menu: Menu<UIFillEditorColorMode>;
  onAction: (id: UIFillEditorColorMode) => void;
}
function getIconUrl(id: UIFillEditorColorMode): string {
  switch (id) {
    case UIFillEditorColorMode.Hering:
      return picker_hering_icon;
    case UIFillEditorColorMode.Lightness:
      return picker_lightness_icon;
    case UIFillEditorColorMode.Saturation:
      return picker_saturation_icon;
  }
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
          <img src={getIconUrl(id)} alt={`${id}`} className={"w2"} />
          <p className={"sans-serif f7 black ma0 pa0"}>{e.label}</p>
        </button>
      ))}
    </nav>
  );
}
