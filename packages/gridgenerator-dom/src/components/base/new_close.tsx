import { justClick } from "../../common";
export interface INewCloseBtnProps {
  className?: string;
  onAction: () => void;
  rotated: boolean;
  big: boolean;
}
const noPropagation = justClick;
export const NewCloseBtn = (props: INewCloseBtnProps) => (
  <button
    className={`NewCloseBt ${props.className ||
      ""} hover-opacity bg-transparent pointer bn ma0 pa0`}
    onClick={props.onAction}
    {...noPropagation}
  >
    <svg
      viewBox={props.big ? "10 10 54 54" : "0 0 64 64"}
      className={""}
      style={{ transform: `rotate(${props.rotated ? "45deg" : "0"})` }}
    >
      <path
        d={
          "M42.001,29.999h-8v-8.001c0-1.104-0.896-2-2-2s-2,0.896-2,2 v8.001h-8c-1.104,0-2,0.895-2,2c0,1.104,0.896,2,2,2h8v8c0,1.104,0.896,2,2,2s2-0.896,2-2v-8h8c1.104,0,2-0.896,2-2 C44.001,30.894,43.105,29.999,42.001,29.999z"
        }
        fill={"#333333"}
      />
    </svg>
  </button>
);
