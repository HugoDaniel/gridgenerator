import { LinkedEvent, linkEvent } from 'inferno';
// @ts-ignore
import export_animation from '../../../assets/icons/export-animation.svg';
// @ts-ignore
import export_image from '../../../assets/icons/export-image.svg';
import { ExportEditorFormat, PlayerState, UIExportEditor } from '../../../data';
import { ExportAt } from '../../../data';
import { ExportEvents } from '../../events/export_events';
import { PlayerEvents } from '../../events/player_events';
import { Button } from '../base/buttons';
import { ExportAnimation, IExportAnimationProps } from './export/animation';
import { ExportDone, IExportDoneProps } from './export/done';
import { ExportImage, IExportImageProps } from './export/image';
import { ExportPayment, IExportPaymentProps } from './export/payment';
export interface IExportProps {
	className?: string;
	events: ExportEvents;
	data: UIExportEditor;
	playerEvents: PlayerEvents;
	playerData: PlayerState | null;
	height?: number;
	onExit: () => void;
}
function selectProductComponent(props: IExportProps) {
	switch (props.data.at) {
		case ExportAt.Image:
		return (
			<ExportImage data={props.data} events={props.events} />
		);
		case ExportAt.Video:
		return (
			<ExportAnimation data={props.data} events={props.events} playerEvents={props.playerEvents} playerData={props.playerData} />
		);
		case ExportAt.Done:
		return (
			<ExportDone data={props.data} events={props.events} height={props.height} />
		);
		default:
		return (
			renderPayment(props)
		);
	}
}
function renderPayment(props: IExportProps) {
	return (
		<ExportPayment
			onComponentDidMount={props.events.loadPaypal}
			height={props.height}
			onExit={props.onExit}
		/>
	);
}
function renderExport(props: IExportProps) {
	return (
		<div
		style={{ height: props.height }}
		className={`Export ${props.className || ''}
		flex justify-center items-center editormw editor-shadow sans-serif h-100`}
	>
		<section className="w-100 flex flex-column items-center justify-center">
			<h2 className="">
				Export project
			</h2>
			<div className="flex items-center justify-center gray">
				<a
					className={`pv2 ph4 ${props.data.at === ExportAt.Image ? 'z-1 br bl bt b--gray bg-white black bold' : 'bg-transparent gray' } flex f6 link dim ttu pointer`}
					onClick={props.events.onChangeToImage}
					> <img className="mr2 w1 h1" src={export_image} /> Image </a>
				<a
					className={`pv2 ph4 ${props.data.at === ExportAt.Video ? 'z-1 br bl bt b--gray bg-white black bold' : 'bg-transparent gray' } flex f6 link dim ttu pointer`}
					onClick={props.events.onChangeToVideo}
				> <img className="mr2 w1 h1" src={export_animation} /> Animation </a>
			</div>
			<div
				className="bt b--gray bg-white w-100"
				style={{ 'box-shadow': 'inset -5px 0 2px -1px #ccc', 'transform': 'translateY(-1px)' }}
			>
				{selectProductComponent(props)}
			</div>
			<hr className="mt4 w5 bb bw1 b--black-10" />
			<div className="mt4 flex items-center justify-center">
				<Button
					className="mh2"
					bg="transparent"
					color="dark-gray"
					label={props.data.at === ExportAt.Done ? 'Done' : 'Cancel'}
					onAction={props.onExit}
				/>
				<Button
					className="mh2"
					label={props.data.at === ExportAt.Done ? 'Download It' : 'Export'}
					onAction={props.events.onExport}
				/>
			</div>
		</section>
	</div>
	);
}
function renderLoading(props: IExportProps) {
	return (
		<div
			style={{ height: props.height }}
			className={`ExportLoading ${props.className || ''}
			flex justify-center items-center editormw editor-shadow sans-serif h-100`}
		>
			<section className="w-100 flex flex-column items-center justify-center">
				<h2 className="">
					{ props.data.at === ExportAt.Preparing ? 'Preparing file' : 'Loading' }
				</h2>
				<p className="">
					{ props.data.at === ExportAt.Preparing ? 'Please wait (takes a couple of minutes)'
					: 'Please wait' }
				</p>
				<div className="mt4 flex items-center justify-center">
				<Button
					className="mh2"
					bg="transparent"
					color="dark-gray"
					label="Cancel"
					onAction={props.onExit}
				/>
				</div>
			</section>
		</div>
	);
}
export const Export = (props: IExportProps) => {
	if (props.data.isLoading || props.data.at === ExportAt.Preparing) {
		return renderLoading(props);
	} else
	if (props.data.needsPayment) {
		return renderPayment(props);
	} else {
		return renderExport(props);
	}
};