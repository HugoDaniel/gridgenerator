// @ts-ignore
import next_icon from '../../../assets/icons/controls-next.svg';
// @ts-ignore
import pause_icon from '../../../assets/icons/controls-pause.svg';
// @ts-ignore
import play_icon from '../../../assets/icons/controls-play.svg';
// @ts-ignore
import prev_icon from '../../../assets/icons/controls-prev.svg';
// @ts-ignore
import begin_icon from '../../../assets/icons/controls-tobegin.svg';
// @ts-ignore
import end_icon from '../../../assets/icons/controls-toend.svg';
export interface IPlayerControls {
	className?: string;
	onPlay: () => void;
	onPause: () => void;
	onNext: () => void;
	onPrev: () => void;
	onToBegin: () => void;
	onToEnd: () => void;
	isPlaying: boolean;
	isAtStart: boolean;
	isAtEnd: boolean;
}
export const PlayerControls = (props: IPlayerControls) => {
	const btncx = 'button-reset bg-transparent h2 w2 pa0 pointer bn flex dim mh1 mh2-ns mv0';
	const btnoff = ' o-30';
	return (
		<nav className={`PlayerControls ${props.className || ''}`}>
			{ props.isPlaying ? [
			<button className={btncx} onClick={props.onPause}>
				<img src={pause_icon} alt="Pause" title="Pause animation" />
			</button>
			] : [
			<button className={btncx} onClick={props.isAtStart ? null : props.onToBegin}>
				<img className={(props.isAtStart ? btnoff : '')} src={begin_icon} alt="To Start" title="Go to the start of the animation" />
			</button>,
			<button className={btncx} onClick={props.isAtStart ? null : props.onPrev}>
				<img className={(props.isAtStart ? btnoff : '')} src={prev_icon} alt="Previous" title="Move one action backwards" />
			</button>,
			<button className={btncx} onClick={props.onPlay}>
				<img src={play_icon} alt="Play" title="play" />
			</button>,
			<button className={btncx} onClick={props.isAtEnd ? null : props.onNext}>
				<img className={(props.isAtEnd ? btnoff : '')} src={next_icon} alt="Next" title="Move one action forward" />
			</button>,
			<button className={btncx} onClick={props.isAtEnd ? null : props.onToEnd}>
				<img className={(props.isAtEnd ? btnoff : '')} src={end_icon} alt="To End" title="Move to the end" />
			</button>
			]
		}
		</nav>
	);
};
