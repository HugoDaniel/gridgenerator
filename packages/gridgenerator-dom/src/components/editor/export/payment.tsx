// @ts-ignore
import export_animation from '../../../../assets/icons/export-animation.svg';
// @ts-ignore
import export_image from '../../../../assets/icons/export-image.svg';
import { Button } from '../../base/buttons';
import { TotalPrice } from '../product/total';

export interface IExportPaymentProps {
	className?: string;
	height: number | undefined;
	onExit: () => void;
}
export const ExportPayment = (props: IExportPaymentProps) => {
	return (
		<div
			style={{ height: props.height }}
			className={`ExportPayment ${props.className || ''}
			flex justify-center items-center editormw editor-shadow sans-serif h-100`}
		>
		<section className="w-100 flex flex-column items-center justify-center">
			<h2 className="">
				Locked feature
			</h2>
			<div
				className="bt b--gray bg-white w-100 flex flex-column justify-center items-center"
				style={{ 'box-shadow': 'inset -5px 0 2px -1px #ccc', 'transform': 'translateY(-1px)' }}
			>
				<p className="b tc">Exporting this project is a paid feature<br/>By paying you can save it as</p>
				<div className="w5 flex items-center">
					<img className="w2 mr3" src={export_image} alt="image" />
					<p className="">Image <span className="f6 i">(SVG or PNG)</span></p>
				</div>
				<div className="w5 flex items-center">
					<img className="w2 mr3" src={export_animation} alt="image" />
					<p className="">Animation <span className="f6 i">(GIF or MP4)</span></p>
				</div>
				<p className="f6 mb3">You will also be supporting Grid Generator.</p>
			</div>
			<hr className="mt4 w5 bb bw1 b--black-10" />
			<TotalPrice products={[ { price: 4.69, quantity: 1 }]} />
			<div className="mt4 flex flex-column items-center justify-center">
				<div id="paypal-button"></div>
				<Button
					className="mv3"
					bg="transparent"
					color="dark-gray"
					label="Cancel"
					onAction={props.onExit}
					/>
			</div>
		</section>
	</div>
	);
};
