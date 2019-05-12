// @ts-ignore
import shirt_icon from "../../../assets/icons/shirt.svg";

import { linkEvent } from "inferno";
import { FeaturesMenuId, Menu } from "gridgenerator-data";
import { justClick } from "../../common";
const noPropagation = justClick;

export interface IFeaturesMenuProps {
  className?: string;
  menu: Menu<FeaturesMenuId>;
  canUseFeatures: boolean;
  onAction: (id: FeaturesMenuId, e: Event) => void;
  gotoLogin: () => void;
}

export const FeaturesMenu = (props: IFeaturesMenuProps) => (
  <nav className={`FeaturesMenu ${props.className || ""}`} $HasKeyedChildren>
    {props.menu.map((_id, e, isSelected) => {
      const id: string = _id;
      const label = e.label;
      // onClick={props.canUseFeatures ? linkEvent(id, props.onAction) : (evt: Event) => { evt.preventDefault(); props.gotoLogin(); } }
      return (
        <a
          onClick={linkEvent(id, props.onAction)}
          href={props.canUseFeatures ? `/${id}` : "/login"}
          key={`featuresmenu-${id}`}
          {...noPropagation}
          className={`f7 dim no-underline black ttu sans-serif dib ph2 pointer top-bar ${
            isSelected ? "top-bar-selected" : ""
          }`}
        >
          {id === FeaturesMenuId.Product ? (
            <div className="flex items-center justify-center">
              <p className="mr1">{label}</p>
              <img src={shirt_icon} className="mb1 w1 h1" />
            </div>
          ) : (
            label
          )}
        </a>
      );
    })}
  </nav>
);
