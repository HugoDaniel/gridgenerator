import {
  FatState,
  ProjectMap,
  State,
  UIPublishEditor
} from "gridgenerator-data";
import { IGraphQLResponse, Net, Runtime } from "gridgenerator-engine";
import { IEventHandler } from "../common";
import { Refresher } from "./refresher";

export class PublishEvents implements IEventHandler {
  public runtime: Runtime;
  public state: FatState;
  public refresher: Refresher;
  public net: Net;
  public projects: ProjectMap;
  public onPublish: (data: UIPublishEditor, e: Event) => void;
  public onLicenseCC0: (e: Event) => void;
  public onLicenseCCBY: (e: Event) => void;
  public onLicenseCCSA: (e: Event) => void;
  public onLicenseCCNC: (e: Event) => void;
  public onLicenseCCND: (e: Event) => void;
  public enterLicense: (e: Event) => void;
  public exitLicense: () => void;
  // event handler:
  public onMouseDown: (e: MouseEvent) => void;
  public onMouseMove: (e: MouseEvent) => void;
  public onMouseUp: (e: MouseEvent) => void;
  public onTouchStart: (e: TouchEvent) => void;
  public onTouchMove: (e: TouchEvent) => void;
  public onTouchEnd: (e: TouchEvent) => void;
  public onTouchCancel: (e: TouchEvent) => void;
  constructor(
    rt: Runtime,
    s: FatState,
    net: Net,
    refresher: Refresher,
    proj: ProjectMap
  ) {
    this.runtime = rt;
    this.state = s;
    this.refresher = refresher;
    this.net = net;
    this.projects = proj;
    this.onPublish = (data, e) => {
      const form = this.getFormValues();
      const desc = form.desc;
      let title = form.title;
      if (!title) {
        title = "Untitled";
        // TODO: set publish error state & msg
        // return;
      }
      if (!this.runtime.token) {
        this.state.publishError("Please login first.");
        return;
      }
      const license = this.state.current.ui.publishEditor.license;
      // set the title, description, license, render an svg and dup the state:
      this.projects.prepareToPublish(
        this.state.current as State,
        this.state,
        title,
        desc,
        license
      );
      // set publish state to loading
      this.state.publishStartLoading();
      this.refresher.refreshStateAndDOM(this.state);
      // TODO: set loading
      // send net req.
      this.net.publish
        .publishProject(this.runtime.token, this.projects.current)
        .then(
          (response: IGraphQLResponse) => {
            if (response.errors) {
              this.state.publishError(Net.graphqlErrorMsg(response));
              this.refresher.refreshStateAndDOM(this.state);
              console.log("GOT ERROR PUBLISH DATA", response);
              return;
            } else {
              console.log("GOT PUBLISHED DATA", response);
              // update current project with id and creation times
              if (response.data) {
                console.log("VALID", response.data);
                this.projects = this.projects.publishCurrent(
                  response.data.newWork.work
                );
                this.state.publishSuccess();
                this.refresher.refreshProjectsOnly(this.projects);
                this.refresher.refreshStateAndDOM(this.state);
              }
            }
          },
          fail => {
            // console.log('GOT ERROR', fail);
            this.state.publishError(Net.graphqlErrorMsg(fail));
            this.refresher.refreshStateAndDOM(this.state);
          }
        );
    };
    this.onLicenseCC0 = (e: Event) => {
      e.preventDefault();
      if (this.state.current.ui.publishEditor.license === "CC0") {
        this.state.publishSetLicense("BY");
      } else {
        this.state.publishSetLicense("CC0");
      }
      this.refresher.refreshStateAndDOM(this.state);
    };
    this.onLicenseCCBY = (e: Event) => {
      e.preventDefault();
      if (this.state.current.ui.publishEditor.license !== "CC0") {
        this.state.publishSetLicense("CC0");
      } else {
        this.state.publishSetLicense("BY");
      }
      this.refresher.refreshStateAndDOM(this.state);
    };
    this.onLicenseCCSA = (e: Event) => {
      e.preventDefault();
      let license = "BY_SA";
      switch (this.state.current.ui.publishEditor.license) {
        case "CC0":
        case "BY":
          license = "BY_SA";
          break;
        case "BY_SA":
          license = "BY";
          break;
        case "BY_NC":
          license = "BY_NC_SA";
          break;
        case "BY_ND":
          license = "BY_SA";
          break;
        case "BY_NC_ND":
          license = "BY_NC_SA";
          break;
        case "BY_NC_SA":
          license = "BY_NC";
          break;
      }
      this.state.publishSetLicense(license);
      this.refresher.refreshStateAndDOM(this.state);
    };
    this.onLicenseCCNC = (e: Event) => {
      e.preventDefault();
      let license = "BY-NC";
      switch (this.state.current.ui.publishEditor.license) {
        case "CC0":
        case "BY":
          license = "BY_NC";
          break;
        case "BY_SA":
          license = "BY_NC_SA";
          break;
        case "BY_NC":
          license = "BY";
          break;
        case "BY_ND":
          license = "BY_NC_ND";
          break;
        case "BY_NC_ND":
          license = "BY_ND";
          break;
        case "BY_NC_SA":
          license = "BY_SA";
          break;
      }
      this.state.publishSetLicense(license);
      this.refresher.refreshStateAndDOM(this.state);
    };
    this.onLicenseCCND = (e: Event) => {
      e.preventDefault();
      let license = "BY-ND";
      switch (this.state.current.ui.publishEditor.license) {
        case "CC0":
        case "BY":
          license = "BY_ND";
          break;
        case "BY_SA":
          license = "BY_ND";
          break;
        case "BY_NC":
          license = "BY_NC_ND";
          break;
        case "BY_ND":
          license = "BY";
          break;
        case "BY_NC_ND":
          license = "BY_NC";
          break;
        case "BY_NC_SA":
          license = "BY_NC_ND";
          break;
      }
      this.state.publishSetLicense(license);
      this.refresher.refreshStateAndDOM(this.state);
    };
    this.enterLicense = (e: Event) => {
      e.preventDefault();
      const { title, desc } = this.getFormValues();
      this.state.publishEnterLicense(title, desc);
      this.refresher.refreshStateAndDOM(this.state);
    };
    this.exitLicense = () => {
      this.state.publishExitLicense();
      this.refresher.refreshStateAndDOM(this.state);
    };
    this.onMouseDown = e => {
      return;
    };
    this.onMouseUp = e => {
      return;
    };
    this.onMouseMove = e => {
      return;
    };
    this.onTouchStart = e => {
      return;
    };
    this.onTouchMove = e => {
      return;
    };
    this.onTouchEnd = e => {
      return;
    };
    this.onTouchCancel = e => {
      return;
    };
  }
  private getFormValues(): { title: string | null; desc: string | null } {
    const titleElem = document.getElementById(
      "publish-title"
    ) as HTMLInputElement | null;
    const descElem = document.getElementById(
      "publish-desc"
    ) as HTMLTextAreaElement | null;
    let title: string | null = null;
    let desc: string | null = null;
    if (titleElem && titleElem.value) {
      title = titleElem.value;
    }
    if (descElem && descElem.value) {
      desc = descElem.value;
    }
    return { title, desc };
  }
}
