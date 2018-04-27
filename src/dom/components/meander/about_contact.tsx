// @ts-ignore
import instagram_icon from '../../../assets/icons/social-insta.svg';
// @ts-ignore
import twitter_icon from '../../../assets/icons/social-twitter.svg';

export interface IAboutContactProps {
	className: string;
	titleClassName: string;
	subtitleClassName: string;
	textClassName: string;
}
export const AboutContact = (props: IAboutContactProps) =>
	<address
		className={`AboutContact user-select ${props.className}`}
	>
		<h1 className={props.titleClassName}>Connect with Grid Generator</h1>
		<h2 className={props.subtitleClassName}>Social Networks</h2>
		<div className="contact-social mt2 flex-column items-center justify-center">
			<a href="https://twitter.com/grid_generator" target="_blank">
				<img className="w2 h2 ma2" src={twitter_icon} alt="twitter" />
			</a>
			<a href="https://www.instagram.com/gridgenerator/" target="_blank">
				<img className="w2 h2 ma2" src={instagram_icon} alt="instagram" />
			</a>
		</div>
		<h2 className={props.subtitleClassName}>Customer Support</h2>
		<p className={props.textClassName}>Contact for all support requests <a className="link pointer" href="mailto:support@gridgenerator.com">here</a></p>
		<h2 className={props.subtitleClassName}>Press Inquiries</h2>
		<p className={props.textClassName}>Contact for press and media questions <a className="link pointer" href="mailto:press@gridgenerator.com">here</a></p>
		<h2 className={props.subtitleClassName}>General</h2>
		<p className={props.textClassName}>Can’t find the right category above ? Get in touch <a className="link pointer" href="mailto:contact@gridgenerator.com">here</a></p>
		<h2 className={props.subtitleClassName}>Address</h2>
		<p className={props.textClassName}>Started in <a className="link pointer" href="https://pt.wikipedia.org/wiki/Alenquer_(Portugal)">Alenquer </a> I now spend most of my days in Lisbon. You can visit me at:</p>
		<p className={props.textClassName}>Rua Heróis de Quionga, n.25 r/c esq., 1170-178 Lisbon. </p>
	</address>
	;
