import { Component } from "inferno";
import { UIShapeEditor, Vector2D, VectorSet } from "gridgenerator-data";
import { IShapePointAttribs, ShapePoint } from "./point";
export interface IShapeGridProps {
  className?: string;
  style?: object;
  size: number;
  shapeEditor: UIShapeEditor;
  onShapeMount: () => void;
  onPointAction: (e: IShapePointAttribs) => void;
}

const ShapeGridColor0 = "#333333";
const ShapeGridColor2 = "#EEEEEE";

function renderPts(
  pts: Vector2D[],
  clickablePts: VectorSet,
  selectedPts: VectorSet,
  action: ((e: IShapePointAttribs) => void) | null
): InfernoElement<typeof ShapePoint>[] {
  const result: any = [];
  for (let i = 0; i < pts.length; i++) {
    result.push(
      <ShapePoint
        pointAttribs={{
          x: pts[i].x,
          y: pts[i].y,
          isActive: selectedPts.has(pts[i]),
          isClickable: clickablePts.has(pts[i])
        }}
        onAction={action}
        key={`${pts[i].x},${pts[i].y}`}
      />
    );
  }
  return result;
}

function renderShapes(shapesD: string[], fills: string[]) {
  const result: JSX.Element[] = [];
  for (let i = 0; i < shapesD.length; i++) {
    result.push(
      <path key={`${i}-${shapesD[i]}`} d={shapesD[i]} fill={fills[i]} />
    );
  }
  return result;
}

export class ShapeGrid extends Component<IShapeGridProps, any> {
  public componentDidMount() {
    this.props.onShapeMount();
  }
  public render() {
    const props = this.props;
    const margin = 30;
    const halfMargin = margin / 2;
    const maxLen = props.shapeEditor.templateRes + margin;
    return (
      <svg
        className={`ShapeGrid ${props.className || ""}`}
        version={"1.1"}
        baseProfile={"basic"}
        xmlns={"http://www.w3.org/2000/svg"}
        width={props.size}
        height={props.size}
        style={props.style}
        viewBox={`-${halfMargin} -${halfMargin} ${maxLen} ${maxLen}`}
      >
        {[
          <rect
            x={-halfMargin}
            y={-halfMargin}
            width={maxLen}
            height={maxLen}
            fill={ShapeGridColor2}
          />,
          ...renderShapes(props.shapeEditor.shapesD, props.shapeEditor.fills),
          <path
            d={props.shapeEditor.templatePath}
            stroke={ShapeGridColor0}
            fill={"transparent"}
            stroke-width={"1px"}
            stroke-dasharray={"4 4"}
          />,
          <path
            d={props.shapeEditor.currentShape}
            className={"current-shape-stroke orange-stroke gold-fill"}
            stroke-width={"3"}
            fill-opacity={"0.6"}
          />,
          <g className={"points"} $HasKeyedChildren>
            {renderPts(
              props.shapeEditor.allPts,
              props.shapeEditor.clickablePts,
              props.shapeEditor.selectedPts,
              props.onPointAction
            )}
          </g>,
          props.shapeEditor.currentEdge ? (
            <ShapePoint
              pointAttribs={{
                x: props.shapeEditor.currentEdge.x,
                y: props.shapeEditor.currentEdge.y,
                isActive: true,
                isCurrentEdge: true
              }}
              onAction={null}
            />
          ) : (
            <g className={"no-edge1"} />
          ),
          props.shapeEditor.otherEdge ? (
            <ShapePoint
              pointAttribs={{
                x: props.shapeEditor.otherEdge.x,
                y: props.shapeEditor.otherEdge.y,
                isOtherEdge: true
              }}
              onAction={props.onPointAction}
            />
          ) : (
            <g className={"no-edge2"} />
          )
        ]}
      </svg>
    );
  }
}
