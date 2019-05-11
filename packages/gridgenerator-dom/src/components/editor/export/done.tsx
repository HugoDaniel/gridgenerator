// @ts-ignore
import export_done from "../../../../assets/icons/export-done.svg";
import { UIExportEditor } from "gridgenerator-data";
import { ExportEvents } from "../../../events/export_events";

export interface IExportDoneProps {
  className?: string;
  height?: number;
  events: ExportEvents;
  data: UIExportEditor;
}
export const ExportDone = (props: IExportDoneProps) => (
  <div
    className={`ExportDone ${props.className || ""}
		flex justify-center items-center editormw editor-shadow sans-serif h-100`}
  >
    <section className="w-100 flex flex-column items-center justify-center">
      <h2 className="">Your file is ready</h2>
      <img className="pv3" src={export_done} alt="Done" />
    </section>
  </div>
);
