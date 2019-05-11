import { Button } from "../base/buttons";

export interface ISaveProps {
  className?: string;
  style?: object;
  onSave: () => void;
  height?: number;
  onExit: () => void;
}
export const Save = (props: ISaveProps) => {
  return (
    <div
      style={{ height: props.height }}
      className={`Save ${props.className || ""}
			flex justify-center items-center editormw editor-shadow sans-serif h-100`}
    >
      <section className="w-100 flex flex-column items-center justify-center">
        <h2 className="">Save locally</h2>
        <div className="flex items-center justify-center gray" />
        <div
          className="bt b--gray h5 bg-white w-100"
          style={{
            "box-shadow": "inset -5px 0 2px -1px #ccc",
            transform: "translateY(-1px)"
          }}
        >
          Stuff Here
        </div>
        <hr className="mt4 w5 bb bw1 b--black-10" />
        <div className="mt4 flex items-center justify-center">
          <Button
            className="mh2"
            bg="transparent"
            color="dark-gray"
            label={"Cancel"}
            onAction={props.onExit}
          />
          <Button className="mh2" label={"Save it"} onAction={props.onSave} />
        </div>
      </section>
    </div>
  );
};
