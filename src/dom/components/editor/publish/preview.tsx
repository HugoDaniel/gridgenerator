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
	const subtitleCx = 'mv1';
	return (
		<div style={{ height: props.height }}
			className={`PublishEditor ${props.className || ''}
			flex justify-center items-center editormw editor-shadow sans-serif h-100`}
		>
			<section className="w-100 flex flex-column items-center justify-center">
				<h2 className="mv0">
					Congratulations
				</h2>
				<h3 className="mv0 f5">
					Project now online
				</h3>
				<div className="mt3 w-100 bt bb bg-white flex flex-column items-center justify-center">
					<h4 className="mt4 mb2">
						Access it on your "projects" menu
					</h4>
					<h4 className={`mt4 mb2`}>
						Share it
					</h4>
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
					<h4 className="mt4 mb1">
						Link
					</h4>
					<div className="flex items-center justify-center gray mb4">
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
							<p className={`Button b--black-10 pa2 link f7 br1 mr3 transition-o ba bg-light-gray pointer near-black dim o-100 ttu`}>Copy</p>
							<input id="publish-url" className="input-reset bn sans-serif f6 bg-transparent h2 w5" value={projectUrl} />
						</a>
					</div>
				</div>
				<div className="mt4 w5 flex items-center justify-center">
					<Button
						className="mh2"
						bg="green"
						color="dark-gray"
						label="Done"
						onAction={props.onExit}
						/>
				</div>
			</section>
		</div>
	);
};
