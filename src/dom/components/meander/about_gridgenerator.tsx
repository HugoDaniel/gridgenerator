export interface IAboutGridGeneratorProps {
	className: string;
	titleClassName: string;
	subtitleClassName: string;
}
export const AboutGridGenerator = (props: IAboutGridGeneratorProps) =>
	<section
		className={`AboutGridGenerator user-select ${props.className}`}
	>
		<h1 className={props.titleClassName}>Explore your creativity in new ways</h1>
		<h2 className={props.subtitleClassName}>Customize your shapes and paint them in an infinite grid</h2>
	</section>
	;
