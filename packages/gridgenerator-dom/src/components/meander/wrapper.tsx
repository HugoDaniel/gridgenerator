import { NewCloseBtn } from "../base/new_close";

export interface IMeanderWrapperProps {
  className?: string;
  title?: string;
  children?: any;
  onExit: () => void;
}
export function MeanderWrapper(props: IMeanderWrapperProps) {
  return (
    <section className={`wrapper h-100 ${props.className || ""}`}>
      <header className="flex items-center justify-center absolute top-0 w-100 h3 bg-white bb b--light-gray">
        <h1 className="mt3 pt2 f3 f2-ns tc-ns title truncate">{props.title}</h1>
        <NewCloseBtn
          className={
            "absolute right-2 right-3-ns top-1 flex items-center justify-center w2 h2"
          }
          big={false}
          rotated={true}
          onAction={props.onExit}
        />
      </header>
      <div className="pt5 h-100 pb5" onClick={props.onExit}>
        {props.children}
      </div>
    </section>
  );
}
