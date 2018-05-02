export interface IPatternProps {
	className?: string;
	w: number;
	h: number;
}

export const Pattern = (props: IPatternProps) => {
	return (
		<svg
			className={props.className}
			version="1.1"
			baseProfile="basic"
			xmlns="http://www.w3.org/2000/svg"
			width={props.w}
			height={props.h}
		>
			<rect x="0" y="0" width="100" height="100" fill="#2030AA" />
		</svg>
	);
};
