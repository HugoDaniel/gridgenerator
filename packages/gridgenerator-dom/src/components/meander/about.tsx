import { AboutMenuId, Menu } from "gridgenerator-data";
import { AboutContact } from "./about_contact";
import { AboutGridGenerator } from "./about_gridgenerator";
import { MeanderMenu } from "./menu";
import { IMeanderWrapperProps, MeanderWrapper } from "./wrapper";
export interface IMeanderAboutProps extends IMeanderWrapperProps {
  sectionClassName: string;
  titleClassName: string;
  textClassName: string;
  subtitleClassName: string;
  onMenuAction: (optionId: AboutMenuId, e: Event) => void;
  menu: Menu<AboutMenuId>;
}
export function MeanderAbout(props: IMeanderAboutProps) {
  const mainCx = "";
  return (
    <MeanderWrapper
      className="MeanderAbout"
      title="About"
      onExit={props.onExit}
    >
      <div
        className="h-100 ttn mw7 center bl br b--light-gray bg-meander pb5"
        onClick={(e: Event) => e.stopImmediatePropagation()}
      >
        <MeanderMenu menu={props.menu} onAction={props.onMenuAction} />
        {props.menu.selected === AboutMenuId.GridGenerator ? (
          <AboutGridGenerator
            className={props.sectionClassName}
            titleClassName={props.titleClassName}
            subtitleClassName={props.subtitleClassName}
          />
        ) : (
          <AboutContact
            className={props.sectionClassName}
            titleClassName={props.titleClassName}
            subtitleClassName={props.subtitleClassName}
            textClassName={props.textClassName}
          />
        )}
      </div>
    </MeanderWrapper>
  );
}
