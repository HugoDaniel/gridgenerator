import { linkEvent } from 'inferno';
import { Button } from '../../base/buttons';
export interface IRecentColorsProps {
	className?: string;
	hexValues: string[];
	onColorSelect: (hex: string) => void;
	onCode: () => void;
	isOnCode: boolean;
}
export const RecentColors = (props: IRecentColorsProps) =>
	<nav className={`RecentColors ${props.className || ''}`} >
		<div className="Code dn flex-ns flex-column items-center justify-center">
			<Button className="mt2" label={props.isOnCode ? 'Exit' : 'Code'} onAction={props.onCode} />
		</div>
		<div className="MRU flex flex-column-reverse">
			{ props.hexValues.map((h) =>
				<button
					onClick={linkEvent(h, props.onColorSelect)}
					className="pa0 ma0 w1 h1 w2-ns h2-ns br-100 b--dark-gray dim pointer ba mv2 mv1-ns"
					style={{ 'background-color': h }} />
			)}
		</div>
		<p className="f7-ns f8 ttu gray sans-serif center tc w2">
			In Use
		</p>
	</nav>;
