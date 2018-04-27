import { LinkedEvent, linkEvent } from 'inferno';
// @ts-ignore
import size_icon from '../../../assets/icons/export-size.svg';
import { ExportEditorFormat, UIExportEditor } from '../../../data';
import { ExportEvents } from '../../events/export_events';
import { Button } from '../base/buttons';
export interface IExportProps {
	className?: string;
	events: ExportEvents;
	data: UIExportEditor;
	height?: number;
	isPaidAccount: boolean;
	onExit: () => void;
	onPricing: (e: Event) => void;
	onPublish: LinkedEvent<string, Event> | null;
}
export const Export = (props: IExportProps) =>
<div
	style={{ height: props.height }}
	className={`ExportEditor ${props.className || ''}
	flex justify-center items-center editormw editor-shadow sans-serif h-100`}
>
	{ !props.isPaidAccount
	?
	<section className="w-100 flex flex-column items-center justify-center">
		<h2 className="">
			Export is only available for paid accounts
		</h2>
		<div className="flex flex-column items-center justify-center gray">
			<p className="black">You can either</p>
			<nav>
				<a className="link" href="/pricing" onClick={props.onPricing}>Upgrade your account</a>
				<p>or</p>
				<p className="black"><a className="link" href="/publish" onClick={props.onPublish}>Publish your work </a> as <a className="link" href="https://en.wikipedia.org/wiki/Free_content" target="_blank">Free Content </a> and then export it.</p>
			</nav>
		</div>
	</section>
	:
	<section className="w-100 flex flex-column items-center justify-center">
		<h2 className="">
			Format
		</h2>
		<div className="flex items-center justify-center gray">
			<a onClick={linkEvent(ExportEditorFormat.SVG, props.events.onFormatChange)} className={`f6 link dim ttu dark-gray mh2 pointer ${props.data.format === ExportEditorFormat.SVG ? 'underline' : ''}`}>SVG (vector)</a>
			<a onClick={linkEvent(ExportEditorFormat.PNG, props.events.onFormatChange)} className={`f6 link dim ttu dark-gray mh2 pointer ${props.data.format === ExportEditorFormat.PNG ? 'underline' : ''}`}>PNG (raster)</a>
		</div>
		<h2 className="mt4 pt2">
			Size
		</h2>
		<div className="flex items-center justify-center gray">
			<img className="h2 w2" src={size_icon} alt="grid element size" />
			<span className="dark-gray"> = </span>
			<a onClick={linkEvent(8, props.events.onSizeChange)} className={`f6 link dim ttu dark-gray mh2 pointer ${props.data.sqSize === 8 ? 'underline' : ''}`}>8<span className="ttn">px</span></a>
			<a onClick={linkEvent(32, props.events.onSizeChange)} className={`f6 link dim ttu dark-gray mh2 pointer ${props.data.sqSize === 32 ? 'underline' : ''}`}>32<span className="ttn">px</span></a>
			<a onClick={linkEvent(128, props.events.onSizeChange)} className={`f6 link dim ttu dark-gray mh2 pointer ${props.data.sqSize === 128 ? 'underline' : ''}`}>128<span className="ttn">px</span></a>
			<a onClick={linkEvent(512, props.events.onSizeChange)} className={`f6 link dim ttu dark-gray mh2 pointer ${props.data.sqSize === 512 ? 'underline' : ''}`}>512<span className="ttn">px</span></a>
		</div>
		<div className="f6 dark-gray">
			{ props.data.dim ? `${props.data.dim.width * props.data.sqSize} x ${props.data.dim.height * props.data.sqSize}` : 'aaa'}
		</div>
		<hr className="mt4 w5 bb bw1 b--black-10" />
		<div className="mt4 w5 flex items-center justify-center">
			<Button
				className="mh2"
				bg="transparent"
				color="dark-gray"
				label="Cancel"
				onAction={props.onExit}
				/>
			<Button
				id={props.data}
				className="mh2"
				label="Export"
				onAction={props.events.onExport}
			/>
		</div>
	</section>
	}
</div>;
