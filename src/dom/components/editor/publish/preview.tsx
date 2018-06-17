// @ts-ignore
import copy_icon from '../../../../assets/icons/publish-copy.svg';
// @ts-ignore
import facebook_icon from '../../../../assets/icons/social-facebook.svg';
// @ts-ignore
import twitter_icon from '../../../../assets/icons/social-twitter.svg';
import { Project } from '../../../../data';
import { Button } from '../../base/buttons';

export interface IPublishPreviewProps {
	project: Project;
	className?: string;
	height: number;
	onExit: () => void;
}
export const PublishPreview = (props: IPublishPreviewProps) => {
	const h2cx = 'mt4 mb4';
	let vbw = 512;
	let vbh = 512;
	if (props.project.svgViewBox) {
		vbw = props.project.svgViewBox[2];
		vbh = props.project.svgViewBox[3];
	}
	let w = 220;
	let h = Math.floor(w * vbh / vbw);
	if (vbw < vbh) {
		h = Math.floor(w * vbw / vbh);
	}
	if (h > 128) {
		h = 128;
		w = Math.floor(h * vbh / vbw);
	}
	const xlink = { 'xmlns:xlink': 'http://www.w3.org/1999/xlink' };
	const projectUrl = `https://gridgenerator.com/p/${props.project.id}`;
	return (
		<div
			style={{ height: props.height }}
			className={`PublishPreview ${props.className || ''}
			flex justify-center items-center editormw editor-shadow sans-serif h-100 overflow-auto`}
		>
			<section className="w-100 flex flex-column items-center justify-center pv5 mt4">
				<h3 className="f5 mt4 mb0 w-80 tc">
					Congratulations!<br/>
					The project was published successfully
				</h3>
				<div className="mt3">
					<Button
						className="mh2"
						bg="green"
						color="light-gray"
						label="Done"
						onAction={props.onExit}
					/>
				</div>
				<h2 className="mt4 mb4 dn">
					Preview
				</h2>
				<div className="gray dn">
					<svg
						className="previewsvg"
						version={'1.1'}
						baseProfile={'basic'}
						xmlns={'http://www.w3.org/2000/svg'}
						{...xlink}
						width={`${w}px`}
						height={`${h}px`}
						shape-rendering="crispEdges"
						viewBox={`0 0 ${vbw} ${vbh}`}
						dangerouslySetInnerHTML={ { __html: props.project.svg || '' } }
					/>
				</div>
				<h2 className="mt4 mb3">
					Share
				</h2>
				<div className="flex items-center justify-center gray">
					<a
						className="pointer link mh2"
						href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(projectUrl)}`}
						target="_blank"
					>
						<img src={twitter_icon} className="h2 pointer" alt="Twitter" />
					</a>
					<a
						className="pointer link mh2"
						href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(projectUrl)}`}
						target="_blank"
					>
						<img src={facebook_icon} className="h2 pointer" alt="Facebook" />
					</a>
				</div>
				<h2 className="mt4 mb0">
					Link
				</h2>
				<div className="flex items-center justify-center gray">
					<a className="pointer link flex items-center justify-center" onClick={(e) => {
						e.preventDefault();
						const urlLink = document.getElementById('publish-url') as HTMLInputElement;
						urlLink.select();
						try {
							const successful = document.execCommand('copy');
						} catch (err) {
							// tslint:disable-next-line:no-console
							console.error('Oops, unable to copy', err);
						}
					}}>
						<img src={copy_icon} alt="Copy link Button" className="w2 h2 mr2" />
						<input id="publish-url" className="input-reset bn sans-serif f6 bg-transparent h2 w5" value={projectUrl} />
					</a>
				</div>
			</section>
		</div>
	);
};
