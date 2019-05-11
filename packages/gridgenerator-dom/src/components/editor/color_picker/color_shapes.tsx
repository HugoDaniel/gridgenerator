import { linkEvent } from "inferno";
import { FillId, UIFillPath } from "gridgenerator-data";

export interface IColorShapesProps {
  resolution: number;
  templatePath: string;
  shapesPaths: Map<FillId, UIFillPath>;
  selected: FillId;
  className?: string;
  onAction(fillId?: FillId): void;
}
function buildDefs(paths: Map<FillId, UIFillPath>) {
  const result: any = [];
  for (const entry of paths.entries()) {
    const path = entry[1];
    const id = result.length;
    const href = `#${id}`;
    const xlink = { "xlink:href": href, visibility: "visible" };
    result.push(
      <defs key={`pathdef-${id}`}>
        <path d={path.d} id={id} />
        <clipPath id={`clip-${id}`}>
          <use {...xlink} />
        </clipPath>
      </defs>
    );
  }
  return result;
}
function buildPaths(
  selected: FillId,
  paths: Map<FillId, UIFillPath>,
  onAction: ((fillId: FillId) => void) | null,
  accum: any[]
): any {
  let i: number = 0;
  for (const [fillId, path] of paths.entries()) {
    const id = i++;
    const xlink = { "xlink:href": `#${id}` };

    const action = onAction ? () => onAction(fillId) : onAction;
    accum.push(
      <g key={`pathuse-${id}`}>
        <use
          className={"hover-orange-stroke pointer"}
          {...xlink}
          fill={path.fill}
          // onClick={action}
          // onTouchEnd={action}
          stroke-width={20}
          clip-path={`url(#clip-${id})`}
        />
      </g>
    );
  }
  return accum;
}
function buildShapes(props: IColorShapesProps) {
  let result: any[] = buildDefs(props.shapesPaths);
  const action = props.onAction;
  result = buildPaths(props.selected, props.shapesPaths, action, result);
  result.push(
    <path
      key={"template-path-shape"}
      d={props.templatePath}
      stroke={"#333333"}
      fill={"transparent"}
      stroke-width={10}
    />
  );
  return result;
}
export const ColorShapes = (props: IColorShapesProps) => (
  <svg
    className={`ColorShapes pointer ${props.className || ""}`}
    xmlns={"http://www.w3.org/2000/svg"}
    version={"1.1"}
    baseProfile={"basic"}
    viewBox={`0 0 ${props.resolution} ${props.resolution}`}
    // onClick={props.isExpanded ? null : linkEvent(null, props.onAction)}
    $HasKeyedChildren
  >
    {buildShapes(props)}
  </svg>
);
