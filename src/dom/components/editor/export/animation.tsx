export interface IExportAnimationProps {
	className?: string;
}
export const ExportAnimation = (props: IExportAnimationProps) => {
	return (
		<section className={`ExportAnimation flex ${props.className || ''}`}>
			<div className="mock flex flex-column items-center justify-center ml3 w4 w5-ns">
				Animation
			</div>
		</section>
	);
};
