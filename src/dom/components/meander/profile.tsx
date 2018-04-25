
import { IProfileForm, MeanderProfile, Menu, ProfileMenuId, Project, StoredProject } from '../../../data';
import { ProfileBillingFreq } from '../../../data/meander/profile';
import { IMeanderMenuProps, MeanderMenu } from './menu';
import { IProfileBillingProps, ProfileBilling } from './profile_billing';
import { IProfileMeProps, ProfileMe } from './profile_me';
import { IProfileProjectsProps, ProfileProjects } from './profile_projects';
import { IMeanderWrapperProps, MeanderWrapper } from './wrapper';

export interface IProfileSectionProps extends IMeanderWrapperProps {
	sectionClassName: string;
	titleClassName: string;
	textClassName: string;
	subtitleClassName: string;
	onMenuAction: (optionId: ProfileMenuId, e?: Event) => void;
	onProfileUpdate: (e: Event) => void;
	onProfileHeroName: (e: Event) => void;
	onProjectView: (id: number, e: Event) => void;
	onProjectNew: () => void;
	onPaymentFreqChange: (option: ProfileBillingFreq) => void;
	onBillingCheckout: () => void;
	onBillingExpand: () => void;
	onBillingDone: () => void;
	menu: Menu<ProfileMenuId>;
	profile: MeanderProfile;
	profileId: number;
	profileAbout: string;
	profileName: string;
	profileCreated: string;
	profileForm: IProfileForm | null;
	profileIsLoading: boolean;
	profileHasError: boolean;
	profileLoadingMsg: string | null;
	projects: StoredProject[];
	badges: string[];
	currentProject: Project;
	isLoading: boolean;
}
export function ProfileSection(props: IProfileSectionProps) {
	const mainCx = '';
	return (
		<MeanderWrapper className="MeanderProfile" title={props.title} onExit={props.onExit}>
			<div className="h-100 ttn mw7 center bl br b--light-gray bg-meander pb5" onClick={(e: Event) => e.stopImmediatePropagation()}>
				<MeanderMenu
					menu={props.menu}
					onAction={props.onMenuAction}
				/>
				{ props.menu.selected === ProfileMenuId.Profile ?
					<ProfileMe
						className={props.sectionClassName}
						titleClassName={props.titleClassName}
						subtitleClassName={props.subtitleClassName}
						profileId={props.profileId}
						profileAbout={props.profileAbout}
						profileName={props.profileName}
						profileCreated={props.profileCreated}
						profileForm={props.profileForm}
						badges={props.badges}
						isLoading={props.profileIsLoading}
						onUpdate={props.onProfileUpdate}
						onSuperHero={props.onProfileHeroName}
						hasError={props.profileHasError}
						loadingMsg={props.profileLoadingMsg}
					/>
					: props.menu.selected === ProfileMenuId.Projects ?
					<ProfileProjects
						className={props.sectionClassName}
						titleClassName={props.titleClassName}
						subtitleClassName={props.subtitleClassName}
						projects={props.projects}
						currentProject={props.currentProject}
						onProjectView={props.onProjectView}
						onProjectNew={props.onProjectNew}
						isLoading={props.isLoading}
					/>
					:
					<ProfileBilling
						className={props.sectionClassName}
						titleClassName={props.titleClassName}
						subtitleClassName={props.subtitleClassName}
						isLoading={props.isLoading}
						hasError={false}
						loadingMsg="Loading"
						profile={props.profile}
						onPaymentFreqChange={props.onPaymentFreqChange}
						onBillingCheckout={props.onBillingCheckout}
						onBillingExpand={props.onBillingExpand}
						onBillingDone={props.onBillingDone}
					/>
				}
			</div>
		</MeanderWrapper>
	);
}
