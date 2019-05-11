import { linkEvent } from 'inferno';
import { StoredProject } from '../../../data';
export interface IProjectCard {
	project: StoredProject;
	onView: (id: number, e: Event) => void;
}
export const ProjectCard = (props: IProjectCard) => {
	// <p className="f6 gray mv1">5 mutual friends</p>
	let vbw = 512;
	let vbh = 512;
	if (props.project.svgViewBox) {
		vbw = props.project.svgViewBox[0];
		vbh = props.project.svgViewBox[1];
	}
	let w = 254;
	let h = Math.floor(w * vbh / vbw);
	if (vbw < vbh) {
		h = Math.floor(w * vbw / vbh);
	}
	if (h > 254 || isNaN(h)) {
		h = 190;
		w = Math.floor(h * vbh / vbw);
		if (isNaN(w)) {
			w = 254;
		}
	}
	// const svg = `<svg version="1.1" baseProfile="basic" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height=${h}" shape-rendering="crispEdges" viewBox="0 0 ${vbw} ${vbh}">${props.project.svg}</svg>`;
	// <a className="pointer link tc ph3 pv1 db bg-animate bg-dark-blue hover-bg-blue white f6 br1">Create an update</a>
	// <h1 class="f6 ttu tracked tl">{props.project.title}</h1>
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="110" height="60" shape-rendering="crispEdges" viewBox="0 0 ${vbw} ${vbh}">${props.project.svg}</svg>`;
	const src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
	return (
		<section className="ProjectCard tc pa3 w4">
			<a onClick={linkEvent(props.project.id, props.onView)} className="pointer link dim f6 gray">
				<article className="hide-child relative ba b--black-20 mw5 center">
					<img className="pa0 ma0 h3" src={src} alt="Preview" />
					<div className="pa2 bt b--black-20">
						<div className="flex justify-between items-center">
							<h1 class="truncate f7 ttu tl">{props.project.title}</h1>
						</div>
					</div>
				</article>
			</a>
		</section>
	);
};

/*
				<svg
					className="previewsvg"
					version={'1.1'}
					baseProfile={'basic'}
					xmlns={'http://www.w3.org/2000/svg'}
					{...xlink}
					width={w}
					height={h}
					shape-rendering="crispEdges"
					viewBox={`0 0 ${vbw} ${vbh}`}
					dangerouslySetInnerHTML={ { __html: props.project.svg } }
				/>
				*/
