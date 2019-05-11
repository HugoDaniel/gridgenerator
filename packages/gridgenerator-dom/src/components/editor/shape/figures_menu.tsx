import { linkEvent } from "inferno";
import { Button } from "../../base/buttons";

export interface IFiguresMenuProps {
  className?: string;
  fills: string[];
  shapes: string[];
  resolution: number;
  selected: number;
  size?: number;
  isNotSmall: boolean;
  onFigureAction: (data: { d: string; index: number }) => void;
  onEnterTemplateSelector: () => void;
}
/**
 * Builds an array of <svg> elements, one element for each shape
 */
function renderMenu(props: IFiguresMenuProps): any[] {
  const viewbox = `0 0 ${props.resolution} ${props.resolution}`;
  const className = "ba w1 h1 mh1 dim pointer b--light-silver w2-ns h2-ns";
  const selectedCx = className + " b--orange";
  const btnCx = "color-btn pa0 bn link pointer dim bg-transparent mt1";
  const result: any[] = [];
  for (let i = 0; i < props.shapes.length; i++) {
    result.push(
      <button
        className={btnCx}
        key={`${props.shapes[i]}-${props.fills[i]}`}
        onClick={linkEvent(
          { d: props.shapes[i], index: i },
          props.onFigureAction
        )}
      >
        <svg
          className={props.selected === i ? selectedCx : className}
          version={"1.1"}
          baseProfile={"basic"}
          xmlns={"http://www.w3.org/2000/svg"}
          viewBox={viewbox}
        >
          <path d={props.shapes[i]} fill={props.fills[i]} />
        </svg>
      </button>
    );
  }
  return result;
}
export const FiguresMenu = (props: IFiguresMenuProps) => {
  const hasShapes = props.shapes.length > 0;
  const cx = `FiguresMenu ${props.className ||
    ""} fixed bottom-4 mb3 static-ns`;
  if (!hasShapes) {
    return (
      <div
        className={`${cx}
				w-100 h2 flex items-center justify-center bg-near-white pr0-ns mb0-ns mt2-ns h3-ns items-end-ns ml0-ns`}
        style={
          props.isNotSmall && props.size ? { width: `${props.size}px` } : {}
        }
      >
        <Button
          className="mr0-ns blue b--blue"
          bg="near-white"
          label="Change Shape Template"
          onAction={props.onEnterTemplateSelector}
        />
      </div>
    );
  } else {
    return (
      <nav
        className={`${cx} flex justify-center h2 items-center bg-near-white overflow-y-auto flex-wrap mb0-ns mt2-ns ml0-ns h3-ns items-end-ns justify-center-ns w-100`}
        style={
          props.isNotSmall && props.size ? { width: `${props.size}px` } : {}
        }
      >
        {renderMenu(props)}
      </nav>
    );
  }
};
