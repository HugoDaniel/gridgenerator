import { canDownload, canRemix, PlayerState, StoredProject } from '../../../data';
import { PlayerEvents } from '../../events/player_events';
import { Button } from '../base/buttons';
import { LicenseImg } from '../editor/publish/license_img';
import { Player } from '../player';
import { PlayerControls } from '../player/controls';
import { IMeanderWrapperProps, MeanderWrapper } from './wrapper';
export interface IProjectViewProps extends IMeanderWrapperProps {
	className?: string;
	project: StoredProject | undefined;
	playerState: PlayerState | null;
	playerEvents: PlayerEvents | null;
}
export const ProjectView = (props: IProjectViewProps) => {
	const title = props.project ? props.project.title : 'Loading...';
	return (
		<MeanderWrapper className="ProjectView" title={title} onExit={props.onExit}>
		<div
			className="h-100 ttn center bl br b--light-gray bg-meander"
			style={{ 'max-width': '52rem' }}
			onClick={(e: Event) => e.stopImmediatePropagation()}
		>
			{ props.playerState && props.playerEvents && props.project ? [
			<Player
				className="center player w-80 h5 bg-red"
				state={props.playerState}
				events={props.playerEvents}
			/>,
			<nav className="w-100 ph4-ns flex flex-column items-center justify-center">
				<PlayerControls
					className="h2 flex"
					isPlaying={props.playerState.isPlaying}
					isAtEnd={props.playerState.isAtEnd}
					isAtStart={props.playerState.isAtStart}
					onPlay={props.playerEvents.onPlay}
					onPause={props.playerEvents.onPause}
					onNext={props.playerEvents.onNext}
					onPrev={props.playerEvents.onPrev}
					onToBegin={props.playerEvents.onToBegin}
					onToEnd={props.playerEvents.onToEnd}
				/>
				<div className="mt2 h3 flex items-center justify-center">
					<Button
						label="Remix"
						className="w4"
						bg="transparent"
						color="dark-gray"
						disabled={!canRemix(props.project.legal)}
						onAction={props.playerEvents.onRemix}
					/>
					<LicenseImg className="flex h2" license={props.project.legal} link={true} />
					<Button
						label="Download"
						className="w4"
						bg="transparent"
						color="dark-gray"
						disabled={!canDownload(props.project.legal)}
						onAction={props.playerEvents.onDownload}
					/>
				</div>
			</nav> ]
			:
			<div className="sans-serif f7 gray ttu center player w-80 h5 flex items-center justify-center">
				Loading...
			</div>
			}
		</div>
		</MeanderWrapper>

	);
};

/*

			{ props.project && props.project.}
			<div className="w-100 ph4-ns flex flex-column items-center justify-center">
				<a href="" rel="author">{props.project.author}</a>
			</div>

*/
