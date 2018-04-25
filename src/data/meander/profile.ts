import { Menu, MenuEntry } from '../state/ui/menu';
export const enum ProfileMenuId {
	Profile = 'profile',
	Projects = 'projects',
	Billing = 'billing'
}
export const enum ProfileBillingId {
	Free = 'free',
	Standard = 'standard',
	Enterprise = 'enterprise'
}
export const enum ProfileBillingFreq {
	Monthly = 'monthly',
	Yearly = 'yearly'
}
export const enum ProfileBillingAt {
	CheckoutInfo = 'checkout_info',
	CheckoutInfoExpanded = 'checkout_info_expanded',
	CheckoutThankYou = 'checkout_thankyou',
	History = 'billing_history'
}
export interface IProfileForm {
	name: string;
	about: string;
}
export interface IBillingInvoice {
	status: string;
	date: string;
	ammount: number;
	currency: string;
}
export const enum ProfileStatus { Error = 100, Loading, Success, Nothing }
const DefaultProfileMenu: Map<ProfileMenuId, MenuEntry> = new Map([
	[ ProfileMenuId.Projects, new MenuEntry('My Projects', 'light-green')],
	[ ProfileMenuId.Profile, new MenuEntry('About me', 'lightest-blue')],
	[ ProfileMenuId.Billing, new MenuEntry('Billing', 'light-yellow')]
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
	public billing: ProfileBillingId;
	public billingAt: ProfileBillingAt;
	public billingToken: string | null;
	public billingFreq: ProfileBillingFreq;
	public billingInstance: any | null;
	public billingEmail: string | null;
	public billingCompany: string | null;
	public billingAddressCountry: string | null;
	public billingAddressPostalCode: string | null;
	public billingAddress: string | null;
	public billingVatID: string | null;
	public billingError: string | null;
	public billingSubscription: any | null;
	public billingInvoices: IBillingInvoice[];
	constructor() {
		this.menu = new Menu(DefaultProfileMenu);
		this.menu.selected = ProfileMenuId.Projects;
		this.badges = [];
		this.billing = ProfileBillingId.Free;
		this.billingAt = ProfileBillingAt.CheckoutInfo;
		this.billingToken = null;
		this.billingFreq = ProfileBillingFreq.Yearly;
		this.billingInstance = null;
		this.billingInvoices = [];
		this.clear();
	}
	public isPayedAccount(): boolean {
		return this.billing !== ProfileBillingId.Free;
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
