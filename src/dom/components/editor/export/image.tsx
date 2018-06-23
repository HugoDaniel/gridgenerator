import { linkEvent } from 'inferno';
import { ExportEditorFormat, ExportSize, UIExportEditor } from '../../../../data';
import { ExportEvents } from '../../../events/export_events';
import { ArtSVG } from '../../base/svg';
import { ExportPreview, IExportPreviewProps } from './preview';
export interface IExportImageProps {
	className?: string;
	events: ExportEvents;
	data: UIExportEditor;
}
export const ExportImage = (props: IExportImageProps) => {
	const res = props.data.calcres();
	return (
		<section className={`ExportImage flex ${props.className || ''}`}>
			<div className="mock flex flex-column items-center justify-center ml3 w4 w5-ns">
			{ props.data.imgPreview && props.data.imgViewbox ?
			<ArtSVG className="w4 h4" svg={props.data.imgPreview} viewbox={props.data.imgViewbox} />
			: <div />
			}
			</div>
			<div className="info">
				<h2 className="mt3 mb0 f7">
					Chose Format
				</h2>
				<div className="flex items-start justify-start flex-wrap gray">
					<a onClick={linkEvent(ExportEditorFormat.SVG, props.events.onFormatChange)} className={`flex items-center justify-center mt2 mr2 w3 h2 ba pa2 f7 link dim ttu dark-gray pointer ${props.data.format === ExportEditorFormat.SVG ? 'bw2 b--blue black' : 'gray b--gray'}`}>SVG</a>
					<a onClick={linkEvent(ExportEditorFormat.PNG, props.events.onFormatChange)} className={`flex items-center justify-center mt2 mr2 w3 h2 ba pa2 f7 link dim ttu dark-gray pointer ${props.data.format === ExportEditorFormat.PNG ? 'bw2 b--blue black' : 'gray b--gray'}`}>PNG</a>
				</div>
				<h2 className="mt3 mb0 f7">
					Size
				</h2>
				<div className="flex items-start justify-start flex-wrap gray">
					<a onClick={linkEvent(ExportSize.HDReady, props.events.onSizeChange)} className={`flex items-center justify-center mt2 mr2 w2 h2 ba pa2 f7 link dim ttu dark-gray pointer ${props.data.size === ExportSize.HDReady ? 'bw2 b--blue black' : 'gray b--gray'}`}>S</a>
					<a onClick={linkEvent(ExportSize.FullHD, props.events.onSizeChange)} className={`flex items-center justify-center mt2 mr2 w2 h2 ba pa2 f7 link dim ttu dark-gray pointer ${props.data.size === ExportSize.FullHD ? 'bw2 b--blue black' : 'gray b--gray'}`}>M</a>
					<a onClick={linkEvent(ExportSize.UHD, props.events.onSizeChange)} className={`flex items-center justify-center mt2 mr2 w2 h2 ba pa2 f7 link dim ttu dark-gray pointer ${props.data.size === ExportSize.UHD ? 'bw2 b--blue black' : 'gray b--gray'}`}>L</a>
				</div>
				<h2 className="mt3 mb0 f7">
					Dimension
				</h2>
				<p className="ma0 pa0 f7 ttu">
					{Math.ceil(res.width)} ✕ {Math.ceil(res.height)}
				</p>
				<h2 className="mt3 mb0 f7">
					Pattern
				</h2>
				<input className="w3 w4-ns" type="range" min="1" max="8" step="1" defaultValue={`${props.data.patternSize}`} onChange={props.events.onPatternChange} />
			</div>
		</section>
	);
};
