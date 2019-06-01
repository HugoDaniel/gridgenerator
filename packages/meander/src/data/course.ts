import { MeanderAbout } from "./sections/about";
import { Collective } from "./sections/collective";
import { MeanderLogin } from "./sections/login";
import { MeanderProfile } from "./sections/profile";
import { MeanderRecover } from "./sections/recover";
import { MeanderVerify } from "./sections/verify";
import { MeanderView } from "./sections/view";
export enum MeanderCourse {
  Project = 100,
  Login,
  About,
  Collective,
  Pricing,
  Profile,
  Verify,
  Recover,
  None,
  ViewProject
}
export class Meander {
  private _course: MeanderCourse;
  private _title: string;
  public login: MeanderLogin;
  public profile: MeanderProfile;
  public recover: MeanderRecover;
  public verify: MeanderVerify;
  public about: MeanderAbout;
  public view: MeanderView;
  public collective: Collective;
  constructor() {
    this.about = new MeanderAbout();
    this.login = new MeanderLogin();
    this.profile = new MeanderProfile();
    this.verify = new MeanderVerify();
    this.recover = new MeanderRecover();
    this.view = new MeanderView();
    this.collective = new Collective();
    this._course = MeanderCourse.None;
    this.updateTitle();
  }
  private resetMeanders(c: MeanderCourse) {
    if (c !== MeanderCourse.Login) {
      this.login = new MeanderLogin();
    }
    if (c !== MeanderCourse.Verify) {
      this.verify = new MeanderVerify();
    }
    if (c !== MeanderCourse.Recover) {
      this.recover = new MeanderRecover();
    }
    if (c !== MeanderCourse.ViewProject) {
      this.view = new MeanderView();
    }
  }
  get course() {
    return this._course;
  }
  set course(c: MeanderCourse) {
    this.resetMeanders(c);
    this._course = c;
    this.updateTitle();
  }
  get isPaidAccount() {
    return true; // no paid accounts
  }
  get title() {
    return this._title;
  }
  public hasProfile() {
    return this.profile.id !== null;
  }
  private updateTitle() {
    switch (this._course) {
      case MeanderCourse.Login:
        this._title = "Login";
        break;
      case MeanderCourse.About:
        this._title = "About";
        break;
      case MeanderCourse.Collective:
        this._title = "Collective";
        break;
      case MeanderCourse.Pricing:
        this._title = "Pricing";
        break;
      case MeanderCourse.Profile:
        this._title = "Profile";
        break;
      case MeanderCourse.Project:
      case MeanderCourse.None:
      default:
        this._title = "";
    }
  }
}
