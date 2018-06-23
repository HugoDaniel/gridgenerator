export interface IExportPreviewProps {
	className?: string;
	content: string;
	viewbox: [number, number, number, number];
}
export const ExportPreview = (props: IExportPreviewProps) => {
	return (
		<section className={`ExportPreview flex ${props.className || ''}`}>
			<div className="mock flex flex-column items-center justify-center ml3 w4 w5-ns">
			Preview
			</div>
		</section>
	);
};
