import { Collective } from '../../../data';
import { IMeanderWrapperProps, MeanderWrapper } from './wrapper';

export interface IMeanderCollectiveProps extends IMeanderWrapperProps {
	sectionClassName: string;
	titleClassName: string;
	textClassName: string;
	subtitleClassName: string;
	collective: Collective;
}
export function MeanderCollective(props: IMeanderCollectiveProps) {
	const mainCx = '';
	return (
		<MeanderWrapper className="MeanderCollective" title="Collective" onExit={props.onExit}>
			<div className="flex flex-column items-center justify-center w-100 h-100">
				<p className="f5 ttu center">Nothing here yet</p>
				<p>:'(</p>
			</div>
		</MeanderWrapper>
	);
}
