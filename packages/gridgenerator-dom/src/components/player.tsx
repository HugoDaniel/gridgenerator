import { PlayerState } from "gridgenerator-data";
import { PlayerEvents } from "../events/player_events";
import Canvas from "./base/canvas";
export interface IPlayerProps {
  className?: string;
  state: PlayerState;
  events: PlayerEvents;
}
export const Player = (props: IPlayerProps) => {
  return (
    <div className="Player" onClick={props.events.onClickAction}>
      <Canvas
        className="PlayerCanvas"
        onContext={props.events.onPlayerCanvasInit}
        width={props.state.canvasWidth}
        height={props.state.canvasHeight}
        is3D={false}
      />
    </div>
  );
};
