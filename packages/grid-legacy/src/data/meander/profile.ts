import { Menu, MenuEntry } from '../state/ui/menu';
export const enum ProfileMenuId {
	Profile = 'profile',
	Projects = 'projects',
	Billing = 'billing'
}
export interface IProfileForm {
	name: string;
	about: string;
}

export const enum ProfileStatus { Error = 100, Loading, Success, Nothing }
const DefaultProfileMenu: Map<ProfileMenuId, MenuEntry> = new Map([
	[ ProfileMenuId.Projects, new MenuEntry('My Projects', 'light-green')],
	[ ProfileMenuId.Profile, new MenuEntry('About me', 'lightest-blue')]
]);
export class MeanderProfile {
	public menu: Menu<ProfileMenuId>;
	public id: number | null;
	public name: string | null;
	public about: string | null;
	public badges: string[];
	public created: string | null;
	public form: IProfileForm | null;
	public loadingStatus: ProfileStatus;
	public loadingStatusMsg: string | null;
	constructor() {
		this.menu = new Menu(DefaultProfileMenu);
		this.menu.selected = ProfileMenuId.Projects;
		this.badges = [];
		this.clear();
	}
	public isPayedAccount(): boolean {
		return true; // no paid accounts
	}
	public clear() {
		this.id = null;
		this.form = null;
		this.id = null;
		this.name = null;
		this.about = null;
		this.created = null;
		this.loadingStatus = ProfileStatus.Nothing;
	}
	get filledName(): string | null {
		if (this.form && this.form.name) {
			return this.form.name;
		}
		return this.name;
	}
	get filledAbout(): string | null {
		if (this.form && this.form.about) {
			return this.form.about;
		}
		return this.about;
	}
	public startLoading() {
		this.loadingStatus = ProfileStatus.Loading;
		this.loadingStatusMsg = null;
	}
	public stopLoading(successMsg: string) {
		this.loadingStatus = ProfileStatus.Success;
		this.loadingStatusMsg = successMsg;
	}
	public errorLoading(errorMsg: string) {
		this.loadingStatus = ProfileStatus.Error;
		this.loadingStatusMsg = errorMsg;
	}
	public buildProfile(id: number, name: string, about: string, created: string, badges: string[]) {
		this.id = id;
		this.name = name;
		this.about = about;
		this.created = created;
		this.badges = badges;
	}
	public clearProfile() {
		this.id = null;
		this.name = null;
		this.about = null;
		this.created = null;
	}
}
