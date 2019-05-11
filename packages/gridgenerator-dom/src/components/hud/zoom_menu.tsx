export interface IZoomMenuProps {
  className?: string;
  style?: object;
  percentage: number;
  middleAt: number;
  size: number;
  // onClearAll: () => void;
}
const vlen = 255;
const hlen = 3;
const lineColor = "#5e2ca5";
const cursorColor = "#AA0022";
export const ZoomMenu = (props: IZoomMenuProps) => {
  const cursorPos = vlen * props.percentage;
  return (
    <svg
      className={`ZoomMenu ${props.className || ""}`}
      version={"1.1"}
      baseProfile={"basic"}
      xmlns={"http://www.w3.org/2000/svg"}
      width={32}
      height={props.size}
      style={props.style}
      viewBox={`0 0 16 255`}
    >
      <path
        d={`M${hlen} 0 V ${vlen * props.middleAt} H ${hlen *
          2} H 0 H ${hlen} V ${vlen}`}
        stroke={lineColor}
        stroke-width={1}
        stroke-linecap={"round"}
      />
      <path
        d={`M${hlen * 2} ${cursorPos} H 0`}
        stroke={cursorColor}
        stroke-width={2}
        stroke-linecap={"round"}
      />
    </svg>
    /*
	<nav className={`ZoomMenu ${props.className || ''} ma0 pa0 w3 transition-transform flex flex-column items-center justify-end`}>
		<TextButton {...btnProps} />
	</nav>);
	*/
  );
};
