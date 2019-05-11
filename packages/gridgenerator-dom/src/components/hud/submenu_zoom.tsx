// @ts-ignore
import zoom_in_icon from "../../../assets/icons/zoom-in.svg";
// @ts-ignore
import zoom_out_icon from "../../../assets/icons/zoom-out.svg";
import { justClick } from "../../common";
const noPropagation = justClick;
export interface ISubmenuZoomProps {
  className?: string;
  onZoomIn: (e: Event) => void;
  onZoomOut: (e: Event) => void;
}
// SubmenuZoom absolute bottom-2 pb3 mb5 left-0 w-100 flex items-center justify-center
export const SubmenuZoom = (props: ISubmenuZoomProps) => {
  return (
    <div className="dib">
      <nav className="flex flex-column bottom-circle">
        <a
          className="flex items-center justify-center w2 h2"
          href="#"
          onClick={props.onZoomIn}
          {...noPropagation}
        >
          <img className="w1 h1" src={zoom_in_icon} alt="Zoom in" />
        </a>
        <a
          className="flex items-center justify-center w2 h2"
          href="#"
          onClick={props.onZoomOut}
          {...noPropagation}
        >
          <img className="w1 h1" src={zoom_out_icon} alt="Zoom out" />
        </a>
      </nav>
    </div>
  );
};
