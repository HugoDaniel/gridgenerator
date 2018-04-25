import { linkEvent } from 'inferno';
export interface IRecentColorsProps {
	className?: string;
	hexValues: string[];
	onColorSelect: (hex: string) => void;
}
export const RecentColors = (props: IRecentColorsProps) =>
	<nav
		className={`RecentColors ${props.className || ''}`}
	>
		{ props.hexValues.map((h) =>
			<button
				onClick={linkEvent(h, props.onColorSelect)}
				className="pa0 ma0 w1 h1 w2-ns h2-ns br-100 b--dark-gray dim pointer ba mv2 mv1-ns"
				style={{ 'background-color': h }} />
		)}
		<p className="f7-ns f8 ttu gray sans-serif center tc w2">
			In Use
		</p>
	</nav>;
