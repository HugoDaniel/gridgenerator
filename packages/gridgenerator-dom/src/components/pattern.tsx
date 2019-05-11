import { UpdateAction } from "../common";

export interface IPatternProps {
  action?: UpdateAction;
  className?: string;
  w: number;
  h: number;
  startPosX: number;
  startPosY: number;
  endPosX: number;
  endPosY: number;
  unitSize: number;
}

export const Pattern = (props: IPatternProps) => {
  const color = "#2030AA";
  const l = props.unitSize / 8;
  return (
    <svg
      className={props.className}
      version="1.1"
      baseProfile="basic"
      xmlns="http://www.w3.org/2000/svg"
      width={props.w}
      height={props.h}
    >
      <rect
        x={props.startPosX}
        y={props.startPosY}
        width={props.endPosX - props.startPosX}
        height={props.endPosY - props.startPosY}
        stroke={color}
        stroke-width={l}
        fill="transparent"
      />
      <circle
        cx={props.startPosX}
        cy={props.startPosY}
        r={l * 2}
        fill={color}
      />
      <line
        x1={props.startPosX - l * 3}
        y1={props.startPosY - l * 3}
        x2={props.startPosX - l * 3}
        y2={props.startPosY}
        stroke={color}
      />
      <line
        x1={props.startPosX - l * 3}
        y1={props.startPosY - l * 3}
        x2={props.startPosX}
        y2={props.startPosY - l * 3}
        stroke={color}
      />
      <circle cx={props.endPosX} cy={props.endPosY} r={l * 2} fill={color} />
      <line
        x1={props.endPosX + l * 3}
        y1={props.endPosY + l * 3}
        x2={props.endPosX + l * 3}
        y2={props.endPosY}
        stroke={color}
      />
      <line
        x1={props.endPosX + l * 3}
        y1={props.endPosY + l * 3}
        x2={props.endPosX}
        y2={props.endPosY + l * 3}
        stroke={color}
      />
    </svg>
  );
};
