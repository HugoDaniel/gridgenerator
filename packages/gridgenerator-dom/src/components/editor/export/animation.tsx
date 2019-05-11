import { linkEvent } from "inferno";
import {
  ExportEditorFormat,
  PlayerState,
  UIExportEditor
} from "gridgenerator-data";
import { ExportEvents } from "../../../events/export_events";
import { PlayerEvents } from "../../../events/player_events";
import { ArtSVG } from "../../base/svg";

export interface IExportAnimationProps {
  className?: string;
  events: ExportEvents;
  data: UIExportEditor;
  playerEvents: PlayerEvents;
  playerData: PlayerState | null;
}
export const ExportAnimation = (props: IExportAnimationProps) => {
  const res = props.data.calcres();
  return (
    <section className={`ExportAnimation flex ${props.className || ""}`}>
      <div className="mock flex flex-column items-center justify-center ml3 w4 w5-ns">
        {/* props.playerData ?
					<Player state={props.playerData} events={props.playerEvents} onComponentDidMount={props.playerEvents.onPlay} onComponentWillUnmount={props.playerEvents.onPause} />
				: <div />
				*/}
        {props.data.imgPreview && props.data.imgViewbox ? (
          <ArtSVG
            className="w4 h4"
            svg={props.data.imgPreview}
            viewbox={props.data.imgViewbox}
          />
        ) : (
          <div />
        )}
      </div>
      <div className="info">
        <h2 className="mt3 mb0 f7">Chose Format</h2>
        <div className="flex items-start justify-start flex-wrap gray">
          <a
            onClick={linkEvent(
              ExportEditorFormat.MP4,
              props.events.onFormatChange
            )}
            className={`flex items-center justify-center mt2 mr2 w3 h2 ba pa2 f7 link dim ttu dark-gray pointer ${
              props.data.format === ExportEditorFormat.MP4
                ? "bw2 b--blue black"
                : "gray b--gray"
            }`}
          >
            MP4
          </a>
          <a
            onClick={linkEvent(
              ExportEditorFormat.GIF,
              props.events.onFormatChange
            )}
            className={`flex items-center justify-center mt2 mr2 w3 h2 ba pa2 f7 link dim ttu dark-gray pointer ${
              props.data.format === ExportEditorFormat.GIF
                ? "bw2 b--blue black"
                : "gray b--gray"
            }`}
          >
            GIF
          </a>
        </div>
      </div>
    </section>
  );
};
