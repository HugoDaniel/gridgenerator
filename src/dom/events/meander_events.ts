import { isArray } from 'inferno-shared';
import { AboutMenuId, getCountry, IProfileForm, MainMenuId, Meander, MeanderCourse, MeanderLogin, MeanderView, PlayerState, ProfileBillingAt, ProfileBillingFreq, ProfileBillingId, ProfileMenuId, ProfileStatus, Project, RecoverState, State, StoredProject, VerifyingState } from '../../data';
import { Net, Runtime, Token } from '../../engine';
import { Loading } from '../../engine/runtime/loading';
import { Refresher } from './refresher';
interface IMeanderHistory {
	menuId?: MainMenuId;
	course: MeanderCourse;
}
interface ILoginData {
	u: string;
	p: string;
	error: string | null;
}
interface ILoginResponse {
	result: boolean;
	reason: string;
}
export class MeanderEvents {
	public loading: Loading;
	public runtime: Runtime;
	public meander: Meander;
	public refresher: Refresher;
	public net: Net;
	public appContainer: HTMLElement | null;
	public startLoading: () => void;
	public stopLoading: () => void;
	private initFromToken: (token: string) => Promise<void>;
	public initProject: () => void;
	public onProjectNew: () => void;
	public onProjectView: (id: number, e: Event) => void;
	public onRouteRoot: () => void;
	public onRouteVerify: () => void;
	public onRouteLogin: () => void;
	public onRouteLoginSocial: () => void;
	public onRouteLoginError: () => void;
	public onRouteProfile: () => void;
	public onRouteAbout: () => void;
	public onRoutePricing: () => void;
	public onRouteCollective: () => void;
	public onRouteRecover: () => void;
	public onRouteViewProject: (projNum: string) => void;
	public onAboutSubmenuAction: (optionId: AboutMenuId, e: Event) => void;
	public onProfileSubmenuAction: (optionId: ProfileMenuId, e: Event) => void;
	public onProfileUpdate: (e: Event) => void;
	public onProfileProjects: () => void;
	public onProfilePaymentFreqChange: (op: ProfileBillingFreq) => void;
	public blurProject: () => void;
	public onMenuAction: (id: MainMenuId, e: Event) => void;
	public fromRoute: () => void;
	public gotoRoot: () => void;
	public gotoLogin: () => void;
	public gotoProjects: () => void;
	public gotoPricing: (e?: Event) => void;
	public gotoView: (id: number) => void;
	public verifyEmail: (searchLink: string) => void;
	public loginEmail: (e?: Event) => void;
	public recover: (e: Event) => void;
	public resetPassword: (e: Event) => void;
	public registerEmail: (e?: Event) => void;
	public clearToken: () => void;
	public sessionExpired: () => void;
	// actions from outside:
	// public storeCurProj: () => void; // from ProjectEvents
	// public restorePrevProj: (id: number) => Promise<void>; // from ProjectEvents
	public refreshProjs: (projs: StoredProject[], closeCurrent?: boolean) => void; // from ProjectEvents
	public getProject: (id: number) => StoredProject | undefined;
	public reviveProj: (id: number) => Promise<Project>;
	public reviveNetProj: (proj: any) => Promise<Project>;
	constructor(rt: Runtime, m: Meander, net: Net, refresher: Refresher, storeCurProj: () => void, restorePrevProj: (id: number) => Promise<void>, refreshProjs: (projs: StoredProject[], closeCurrent?: boolean) => void, getProj: (id: number) => StoredProject | undefined, reviveProj: (id: number) => Promise<Project>, reviveNetProj: (proj: any) => Promise<Project>
	) {
		this.runtime = rt;
		this.meander = m;
		this.net = net;
		this.refresher = refresher;
		// this.storeCurProj = storeCurProj;
		// this.restorePrevProj = restorePrevProj;
		this.refreshProjs = refreshProjs;
		this.reviveProj = reviveProj;
		this.reviveNetProj = reviveNetProj;
		this.getProject = getProj;
		this.loading = new Loading();
		this.appContainer = document.getElementById('app');
		this.refresher.refreshRuntimeOnly(this.runtime);
		this.startLoading = () => {
			this.loading.startFullscreen().then((l) => this.loading = l);
		};
		this.stopLoading = () => {
			this.loading.stopFullscreen().then((l) => this.loading = l);
		};

		this.clearToken = () => {
			this.runtime.token = null;
			localStorage.jwt = null;
			this.refresher.refreshMeanderOnly(this.meander);
			this.refresher.refreshRuntimeOnly(this.runtime);
		};
		this.sessionExpired = () => {
			// this.clearToken();
			this.meander.profile.clear();
			this.meander.login.error = `Sorry, your session expired.`;
			this.gotoLogin();
			this.updateDOM();
			this.loading.stopFullscreen();
			this.updateDOM();
			return;
		};
		this.onProjectNew = () => {
			this.loading.startFullscreen().then((l) => this.loading = l);
			this.refresher.refreshNewProject(new Project(new State()));
			this.gotoRoot();
		};
		// called after the webgl ctx is initialized
		this.initProject = () => {
			// unload removes the loading screen and adds the router event handler
			const unload = () => {
				this.loading.stopFullscreen().then((loading) => {
					window.addEventListener('popstate', this.fromRoute);
					this.loading = loading;
					this.unblurProject();
					this.fromRoute();
					this.refresher.refreshMeanderOnly(this.meander);
				});
			};
			// if a token is present, initialize the meander state from it first
			if (localStorage.jwt) {
				this.initFromToken(localStorage.jwt)
				    .then(unload, unload);
			} else {
				unload();
			}
		};
		this.initFromToken = (tokenStr: string) => {
			// SETUP TOKEN
			// use this to easily get the token for curl:
			return new Promise((resolve, reject) => {
				localStorage.jwt = tokenStr;
				const token = new Token(tokenStr);
				localStorage.token = token;
				this.runtime.token = token;
				this.refresher.refreshRuntimeOnly(this.runtime);
				this.meander.profile.startLoading();
				this.refresher.refreshMeanderOnly(this.meander);
				this.updateDOM();
				this.net.profile.getProfile(token).then( (profile) => {
					const p = profile.data.curProfile;
					if (p && p.id) {
						this.meander.profile.buildProfile(p.id, p.name, p.about, p.createdAt, p.badges);
						// get info
						this.meander.profile.stopLoading('');
						this.updateDOM();
						resolve();
					} else {
						this.meander.profile.errorLoading('Profile with no ID. Please get in contact with us.');
						this.updateDOM();
						resolve();
						return;
					}
				}, (error) => {
					if (Net.isUnauthorized(error)) {
						this.sessionExpired();
						return;
					} else {
						this.meander.profile.errorLoading(error);
						this.updateDOM();
					}
				});
			});
		};
		this.blurProject = () => {
			const appElem = this.appContainer;
			if (!appElem) {
				return;
			}
			if (appElem.classList.contains('blur-6')) {
				// no need to blur;
				return;
			}
			appElem.classList.add('blur-0');
			window.requestAnimationFrame(() => {
				window.requestAnimationFrame(() => {
					appElem.classList.add('blur-6');
					appElem.classList.remove('blur-0');
				});
			});
		};
		this.onMenuAction = (id: MainMenuId, e: Event) => {
			e.preventDefault();
			const hist: IMeanderHistory = {
				menuId: id,
				course: this.transformMenuIdToCourse(id)
			};
			const route = window.location.pathname.slice(1);
			if (route !== id) {
				// only push state if currently at a dif. route
				window.history.pushState(hist, id, `/${id}`);
			}
			this.fromRoute();
		};
		this.fromRoute = (e?: PopStateEvent) => {
			const routes = window.location.pathname.slice(1).split('/');
			switch (routes[0]) {
				case MainMenuId.About:
				this.onRouteAbout();
				break;
				case MainMenuId.Collective:
				this.onRouteCollective();
				break;
				case MainMenuId.Pricing:
				this.onRoutePricing();
				break;
				case MainMenuId.Profile:
				this.onRouteProfile();
				break;
				case 'login':
				this.onRouteLogin();
				break;
				case 'loginSocial':
				this.onRouteLoginSocial();
				break;
				case 'loginError':
				this.onRouteLoginError();
				break;
				case 'verify':
				this.onRouteVerify();
				break;
				case 'recover':
				this.onRouteRecover();
				break;
				case 'p':
				this.onRouteViewProject(routes[1]);
				break;
				default:
				this.onRouteRoot();
			}
			this.updateDOM();
		};
		this.onRouteRoot = () => {
			this.unblurProject();
			this.meander.course = MeanderCourse.Project;
		};
		this.onRouteVerify = () => {
			this.meander.course = MeanderCourse.Verify;
			this.verifyEmail(window.location.search);
		};
		this.onRouteLogin = () => {
			// this.storeCurProj();
			this.meander.course = MeanderCourse.Login;
		};
		this.onRouteLoginSocial = () => {
			const query = window.location.search.split('=');
			if (query.length !== 2 || query[0] !== '?t') {
				this.meander.login.isLoading = false;
				this.meander.course = MeanderCourse.Login;
				this.meander.login.error = 'Login failed';
				this.updateDOM();
			} else {
				// TODO: wrap this in a try catch:
				this.initFromToken(query[1]);
				this.gotoRoot();
			}
		};
		this.onRouteLoginError = () => {
			this.meander.course = MeanderCourse.Login;
			this.meander.login.isLoading = false;
			const query = window.location.search.split('=');
			if (query.length !== 2 || query[0] !== '?msg') {
				this.meander.login.error = 'Login failed';
			} else {
				this.meander.login.error = `Login failed: ${decodeURIComponent(query[1])}`;
			}
			this.updateDOM();
		};
		this.onRouteProfile = () => {
			// check if there is a user logged in
			if (this.runtime.token && this.runtime.token.id) {
				this.meander.course = MeanderCourse.Profile;
				if (this.meander.profile.menu.selected === ProfileMenuId.Projects) {
					this.onProfileProjects();
				}
				this.updateDOM();
			} else {
				this.onRouteLogin();
			}
		};
		this.onRouteViewProject = (projNum: string) => {
			this.meander.course = MeanderCourse.ViewProject;
			const projInfo = projNum.split('#');
			const projId = parseInt(projInfo[0], 10);
			if (isNaN(projId)) {
				// TODO: set error message
				return;
			}
			// check if the project is in memory
			const p = this.getProject(projId);
			if (!p) {
				// fetch project from server
				this.net.profile.getProject(projId, this.runtime.token || undefined).then((resp) => {
					const data = resp.data;
					if (data.workById) {
						this.reviveNetProj(data.workById).then( (proj) => {
							const stored = proj.toStored();
							if (!stored) {
								// TODO: set error message
								console.log('ERROR, could not convert project to stored', proj);
								return;
							}
							stored.initialState = data.workById.initialState || '';
							stored.finalState = data.workById.finalState || '';
							stored.fatState = data.workById.fatState || '';
							this.updateProjectView(proj, stored);
						}, (error) => {
							// TODO: set error message
						});
					}
				}, (error) => {
					// TODO: set error message
				});
			} else {
				this.reviveProj(projId).then((proj) => {
					this.updateProjectView(proj, p);
				}, (error) => {
					// TODO: set error message
				});
			}
		};
		this.onRouteAbout = () => {
			this.meander.course = MeanderCourse.About;
			this.updateDOM();
		};
		this.onRoutePricing = () => {
			this.meander.course = MeanderCourse.Pricing;
			this.updateDOM();
		};
		this.onRouteCollective = () => {
			this.meander.course = MeanderCourse.Collective;
		};
		this.onRouteRecover = () => {
			this.meander.course = MeanderCourse.Recover;
		};
		this.onAboutSubmenuAction = (optionId: AboutMenuId, e: Event) => {
			e.preventDefault();
			this.meander.about.menu.selected = optionId;
			this.updateDOM();
		};
		this.onProfileSubmenuAction = (optionId: ProfileMenuId, e: Event) => {
			e.preventDefault();
			this.meander.profile.menu.selected = optionId;
			this.updateDOM();
			if (optionId === ProfileMenuId.Projects) {
				this.onProfileProjects();
			}
		};
		this.gotoPricing = (e?: Event) => {
			if (e) {
				e.preventDefault();
			}
			const hist: IMeanderHistory = {
				course: MeanderCourse.Pricing
			};
			window.history.pushState(hist, 'Grid Generator', '/pricing');
			this.fromRoute();
		};
		this.gotoProjects = () => {
			const hist: IMeanderHistory = {
				course: MeanderCourse.Profile
			};
			window.history.pushState(hist, 'Grid Generator', '/profile');
			this.fromRoute();
		};
		this.gotoRoot = () => {
			const hist: IMeanderHistory = {
				course: MeanderCourse.Project
			};
			window.history.pushState(hist, 'Grid Generator', '/');
			this.fromRoute();
		};
		this.gotoLogin = () => {
			const hist: IMeanderHistory = {
				course: MeanderCourse.Login
			};
			this.clearToken();
			this.refresher.refreshRuntimeOnly(this.runtime);
			window.history.replaceState(hist, 'Grid Generator', '/login');
			this.fromRoute();
		};
		this.gotoView = (id: number) => {
			window.history.pushState(null, 'Grid Generator', `/p/${id}`);
			this.fromRoute();
		};
		this.onProfileUpdate = (e: Event) => {
			const formData = this.getProfileForm();
			if (!this.runtime.token) {
				this.gotoLogin();
				this.updateDOM();
				return;
			}
			this.meander.profile.form = formData;
			this.meander.profile.startLoading();
			this.updateDOM();
			this.net.profile.updateProfile(this.runtime.token, this.meander.profile).then(
				(response) => {
					if (!response.data || !response.data.setProfile || !response.data.setProfile.profile) {
						this.meander.profile.errorLoading('Invalid response from server when updating profile, please get in contact with us.');
						this.updateDOM();
						return;
					}
					// TODO: graphql error response
					const p = response.data.setProfile.profile;
					this.meander.profile.buildProfile(p.id, p.name, p.about, p.createdAt, p.badges);
					this.meander.profile.stopLoading('Profile updated');
					this.updateDOM();
				}, (error) => {
					if (Net.isUnauthorized(error)) {
						this.sessionExpired();
						return;
					} else {
						this.meander.profile.errorLoading(error);
						this.updateDOM();
					}
				}
			);
		};
		this.onProfileProjects = () => {
			if (this.runtime.token) {
				this.meander.profile.startLoading();
				this.net.profile.getProfileProjects(this.runtime.token).then((response) => {
					// create projects with the received data
					const data = response.data;
					if (data.curWorks && data.curWorks.edges && data.curWorks.edges && data.curWorks.edges.length > 0) {
						const projects = data.curWorks.edges.map((edge) => edge.node);
						this.refreshProjs(projects);
					} else {
						// TODO: invalid data from server, set up an error message
					}
					this.meander.profile.stopLoading('');
					this.updateDOM();
				}, (error) => {
					if (Net.isUnauthorized(error)) {
						this.sessionExpired();
						return;
					} else {
						this.meander.profile.errorLoading(error);
						this.updateDOM();
					}
				});
			} else {
				this.gotoLogin();
				this.updateDOM();
			}
		};
		this.verifyEmail = (searchLink: string) => {
			this.net.login.verifyEmail(searchLink).then((res) => {
				if (res.result && res.token) {
					this.meander.verify.state = VerifyingState.Success;
					this.meander.verify.user = 'Welcome to Grid Generator!';
					this.initFromToken(res.token);
				} else if (res.reason === 'User already verified') {
					this.meander.verify.state = VerifyingState.AlreadyVerified;
					this.meander.verify.user = null;
				} else {
					this.meander.verify.state = VerifyingState.Failed;
					this.meander.verify.user = null;
				}
				this.updateDOM();
			}, (error) => {
				this.meander.verify.state = VerifyingState.Failed;
				this.meander.verify.user = null;
				this.updateDOM();
			});
		};
		this.loginEmail = (e?: Event) => {
			if (e) {
				e.preventDefault();
			}
			this.getLoginData().then(
				(loginData) => {
					this.meander.login.isLoading = true;
					this.updateDOM();
					this.net.login.emailLogin(loginData.u, loginData.p).then((res) => {
						if (!res.result) {
							// wrong credentials
							this.meander.login.error = 'Wrong credentials';
							this.meander.login.isLoading = false;
							this.meander.login.showRecover = true;
							this.updateDOM();
						} else {
							const tokenStr = res.token;
							this.initFromToken(tokenStr);
							this.meander.login.error = null;
							this.meander.login.isLoading = false;
							this.gotoRoot();
						}
					}, (error) => {
						this.meander.login.isLoading = false;
						this.meander.login.error = error.message;
						// console.log('ERROR', error);
						this.updateDOM();
					});
				}, (inputError) => {
					this.meander.login.error = inputError;
					this.updateDOM();
					return;
				});
		};
		this.recover = (e: Event) => {
			e.preventDefault();
			this.getInputValue('login-u').then(
				(username) => {
					this.meander.login.isLoading = true;
					this.updateDOM();
					this.net.login.recover(username).then((answer) => {
						if (answer.result) {
							this.meander.login.successEmail = 'Recovery link';
							this.meander.login.successTitle = 'Password recover';
							this.meander.login.success = answer.reason;
						} else {
							this.meander.login.error = answer.reason;
						}
						this.meander.login.isLoading = false;
						this.updateDOM();
						return;
					}, (error) => {
						this.meander.login.isLoading = false;
						this.meander.login.error = error;
						this.updateDOM();
					});
				}, (inputError) => {
					this.meander.login.isLoading = false;
					this.meander.login.error = inputError;
					this.updateDOM();
				}
			);
		};
		this.resetPassword = (e: Event) => {
			if (e) {
				e.preventDefault();
			}
			this.getInputValue('recover-p').then(
				(newPass) => {
					this.meander.recover.state = RecoverState.Recovering;
					this.updateDOM();
					this.net.login.resetPassword(newPass, window.location.search || '').then((answer) => {
						this.meander.login = new MeanderLogin();
						if (answer.result === false) {
							this.meander.login.error = `Sorry ${answer.reason}. Please try to recover the password again`;
							this.meander.login.showRecover = true;
							this.updateDOM();
						} else {
							this.meander.login.success = 'Password updated. Try to login with it.';
						}
						this.meander.course = MeanderCourse.Login;
						this.gotoLogin();
						this.updateDOM();
					}, (error) => {
						this.meander.recover.error = error;
						this.updateDOM();
					});
				}, (inputError) => {
					this.meander.recover.error = inputError;
					this.updateDOM();
				}
			);
		};
		this.registerEmail = (e?: Event) => {
			if (e) {
				e.preventDefault();
			}
			this.getLoginData().then(
				(loginData) => {
					this.meander.login.isLoading = true;
					this.updateDOM();
					this.net.login.emailRegister(loginData.u, loginData.p).then((answer: ILoginResponse) => {
						this.meander.login.isLoading = false;
						this.meander.login.error = null;
						if (answer.result) {
							this.meander.login.success = answer.reason;
							this.meander.login.successEmail = loginData.u;
							this.meander.login.successTitle = 'Thank you';
						} else {
							this.meander.login.error = answer.reason;
						}
						this.updateDOM();
					}, (netError) => {
						this.meander.login.isLoading = false;
						this.meander.login.error = netError.message;
						this.updateDOM();
					});
				}, (inputError) => {
					this.meander.login.error = inputError;
					this.updateDOM();
				}
			);
		};
		this.onProjectView = (id: number, e: Event) => {
			e.preventDefault();
			this.gotoView(id);
		};
	}
	private updateProjectView(proj: Project, p: StoredProject) {
		if (proj.fatState && proj.svg && proj.svgViewBox) {
			const ps = new PlayerState(proj);
			ps.canvasWidth = Math.min(this.runtime.device.width, 830);
			ps.canvasHeight = Math.min((proj.svgViewBox[1] / proj.svgViewBox[0]) * ps.canvasWidth, this.runtime.device.height - 256);
			this.refresher.refreshPlayerInitialState(ps, proj.initialState);
			this.meander.view = new MeanderView();
			this.meander.view.project = p;
			this.updateDOM();
		} else {
			// TODO: set error message
		}
	}
	get containerNode(): HTMLElement {
		let app = this.appContainer;
		if (!app) {
			app = document.getElementById('app');
			if (!app) {
				throw new Error('Cannot find container node in Meander Events');
			}
		}
		return app;
	}
	private getInputValue(id: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const elem = document.getElementById(id) as HTMLInputElement;
			if (!elem) {
				reject(`#${id} element not found`);
			}
			if (!elem.validity.valid) {
				reject(elem.validationMessage);
			}
			resolve(elem.value);
		});
	}
	private async getLoginData(): Promise<ILoginData> {
		const handleError = (error: string) => ({ u: '', p: '', error});
		// get the username and pass and try to login
		return this.getInputValue('login-u').then(
			(username) => this.getInputValue('login-p').then(
				(pass) => ({ u: username, p: pass, error: null }), handleError),
			handleError);
	}
	private getProfileForm(): IProfileForm {
		const newNameElem = document.getElementById('profile-name')  as HTMLInputElement | null;
		if (!newNameElem) {
			throw new Error('Cannot find the profile-name input element');
		}
		const newName = newNameElem.value;
		const newBioElem = document.getElementById('profile-bio')  as HTMLTextAreaElement | null;
		if (!newBioElem) {
			throw new Error('Cannot find the profile-bio textarea element');
		}
		const newBio = newBioElem.value;
		return { name: newName, about: newBio };
	}
	private getBillingInfo(): any {
		let result = {};
		const firstnameElem = document.getElementById('firstname') as HTMLInputElement | null;
		const lastnameElem = document.getElementById('lastname') as HTMLInputElement | null;
		const vatidElem = document.getElementById('vatid') as HTMLInputElement | null;
		const emailElem = document.getElementById('email') as HTMLInputElement | null;
		const companyElem = document.getElementById('company') as HTMLInputElement | null;
		const websiteElem = document.getElementById('website') as HTMLInputElement | null;
		const phoneElem = document.getElementById('phone') as HTMLInputElement | null;
		const regionElem = document.getElementById('region') as HTMLInputElement | null;
		const cityElem = document.getElementById('city') as HTMLInputElement | null;
		const postalElem = document.getElementById('postal') as HTMLInputElement | null;
		const streetElem = document.getElementById('street') as HTMLInputElement | null;
		const countryElem = document.getElementById('country') as HTMLSelectElement | null;
		if (countryElem && countryElem.value && countryElem.value !== '-1') {
			const country = getCountry(parseInt(countryElem.value, 10));
			result = Object.assign(result, { countryCodeNumeric: country.code, countryCodeAlpha2: country.alpha2 });
		}
		if (firstnameElem && firstnameElem.value) {
			result = Object.assign(result, { firstName: firstnameElem.value });
		}
		if (lastnameElem && lastnameElem.value) {
			result = Object.assign(result, { lastName: lastnameElem.value });
		}
		if (vatidElem && vatidElem.value) {
			result = Object.assign(result, { vatid: vatidElem.value });
		}
		if (emailElem && emailElem.value) {
			result = Object.assign(result, { email: emailElem.value });
		}
		if (companyElem && companyElem.value) {
			result = Object.assign(result, { company: companyElem.value });
		}
		if (websiteElem && websiteElem.value) {
			result = Object.assign(result, { website: websiteElem.value });
		}
		if (phoneElem && phoneElem.value) {
			result = Object.assign(result, { phone: phoneElem.value });
		}
		if (regionElem && regionElem.value) {
			result = Object.assign(result, { region: regionElem.value });
		}
		if (cityElem && cityElem.value) {
			result = Object.assign(result, { locality: cityElem.value });
		}
		if (postalElem && postalElem.value) {
			result = Object.assign(result, { postalCode: postalElem.value });
		}
		if (streetElem && streetElem.value) {
			result = Object.assign(result, { streetAddress: streetElem.value });
		}
		return result;
	}
	private transformMenuIdToCourse(id: MainMenuId): MeanderCourse {
		switch (id) {
			case MainMenuId.About:
			return MeanderCourse.About;
			case MainMenuId.Collective:
			return MeanderCourse.Collective;
			case MainMenuId.Pricing:
			return MeanderCourse.Pricing;
			case MainMenuId.Profile:
			// TODO: check if there is a profile
			return MeanderCourse.Login;
		}
		return MeanderCourse.Login;
	}
	private updateDOM() {
		if (this) {
			this.refresher.refreshMeanderOnly(this.meander);
			this.refresher.refreshDOMOnly();
		}
	}
	private unblurProject() {
		const appElem = this.containerNode;
		appElem.classList.remove('blur-6');
	}
}
