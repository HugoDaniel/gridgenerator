import {
  Meander,
  MeanderCourse,
  PlayerState,
  ProfileStatus,
  Project,
  StoredProject,
  MainMenuId,
  Menu
} from "gridgenerator-data";
import { UpdateAction } from "../common";
import { IMainMenuProps, MainMenu } from "./hud/main_menu";
import { MeanderEvents } from "../events/meander_events";
import { PlayerEvents } from "../events/player_events";
import { MeanderAbout } from "./meander/about";
import { MeanderCollective } from "./meander/collective";
import { MeanderLogin } from "./meander/login";
import { MeanderPricing } from "./meander/pricing";
import { ProfileSection } from "./meander/profile";
import { ProjectView } from "./meander/project_view";
import { MeanderRecover } from "./meander/recover";
import { MeanderVerify } from "./meander/verify";

export interface IMeanderProps {
  action?: UpdateAction;
  className?: string;
  projects: StoredProject[];
  currentProject: Project;
  meander: Meander;
  menu: Menu<MainMenuId>;
  isMenuHidden: boolean;
  userId: string | null;
  events: MeanderEvents;
  height: number;
  playerState: PlayerState | null;
  playerEvents: PlayerEvents | null;
}
function selectCourse(props: IMeanderProps) {
  const sectionCx = "overflow-auto h-100 tc";
  const textCx = "f6 fs-normal";
  const titleCx = "mt2 mb0 baskerville i fw1 f1";
  const subtitleCx = "mt3 mb0 f6 fw4 ttu tracked";
  const defaultProps = {
    sectionClassName: sectionCx,
    textClassName: textCx,
    titleClassName: titleCx,
    subtitleClassName: subtitleCx,
    onExit: props.events.gotoRoot
  };
  switch (props.meander.course) {
    case MeanderCourse.Profile:
      const about = props.meander.profile.about || "";
      if (
        props.meander.profile.id &&
        props.meander.profile.name &&
        props.meander.profile.created
      ) {
        return (
          <ProfileSection
            {...defaultProps}
            menu={props.meander.profile.menu}
            profile={props.meander.profile}
            profileId={props.meander.profile.id}
            badges={props.meander.profile.badges}
            profileAbout={about}
            profileName={props.meander.profile.name}
            profileCreated={props.meander.profile.created}
            profileForm={props.meander.profile.form}
            onProfileUpdate={props.events.onProfileUpdate}
            profileIsLoading={
              props.meander.profile.loadingStatus === ProfileStatus.Loading
            }
            profileHasError={
              props.meander.profile.loadingStatus === ProfileStatus.Error
            }
            profileLoadingMsg={props.meander.profile.loadingStatusMsg}
            onMenuAction={props.events.onProfileSubmenuAction}
            projects={props.projects}
            isLoading={
              props.meander.profile.loadingStatus === ProfileStatus.Loading
            }
            currentProject={props.currentProject}
            onProjectView={props.events.onProjectView}
            onProjectNew={props.events.onProjectNew}
            title={props.meander.profile.name || "Profile"}
          />
        );
      }
      break;
    case MeanderCourse.Pricing:
      return <MeanderPricing {...defaultProps} />;
    case MeanderCourse.Collective:
      return (
        <MeanderCollective
          {...defaultProps}
          collective={props.meander.collective}
        />
      );
    case MeanderCourse.About:
      return (
        <MeanderAbout
          {...defaultProps}
          menu={props.meander.about.menu}
          onMenuAction={props.events.onAboutSubmenuAction}
        />
      );
    case MeanderCourse.Verify:
      return (
        <MeanderVerify
          onExit={props.events.gotoRoot}
          state={props.meander.verify.state}
          user={props.meander.verify.user}
        />
      );
    case MeanderCourse.Login:
      return (
        <MeanderLogin
          onExit={props.events.gotoRoot}
          onLogin={props.events.loginEmail}
          onRegister={props.events.registerEmail}
          isLoading={props.meander.login.isLoading}
          errorMsg={props.meander.login.error}
          successMsg={props.meander.login.success}
          successTitle={props.meander.login.successTitle}
          successEmail={props.meander.login.successEmail}
          showRecoverPw={props.meander.login.showRecover}
          onRecover={props.events.recover}
        />
      );
    case MeanderCourse.Recover:
      return (
        <MeanderRecover
          onRecover={props.events.resetPassword}
          isLoading={props.meander.recover.isLoading}
          errorMsg={props.meander.recover.error}
          onExit={props.events.gotoLogin}
        />
      );
    case MeanderCourse.ViewProject:
      return (
        <ProjectView
          {...defaultProps}
          project={props.meander.view.project}
          playerState={props.playerState}
          playerEvents={props.playerEvents}
        />
      );
  }
  return <div />;
}
export const MeanderFull = (props: IMeanderProps) => {
  const mainMenuProps: IMainMenuProps = {
    menu: props.menu,
    userId: props.userId,
    onAction: props.events.onMenuAction,
    className: `fixed bottom-0 left-0 w-100 transition-bg ${
      props.meander.course !== MeanderCourse.Project
        ? "bt pt3 b--light-gray bg-white"
        : "bg-transparent"
    }`
  };
  return (
    <div
      className={`MeanderFull fixed sans-serif transition-transform
				${props.isMenuHidden ? "translate-y-3 " : " "}
				${props.className || ""}`}
    >
      {props.meander.course === MeanderCourse.Project ? (
        <div />
      ) : (
        <div className="children" style={{ height: `${props.height}px` }}>
          {selectCourse(props)}
        </div>
      )}
      <MainMenu {...mainMenuProps} />
    </div>
  );
};
