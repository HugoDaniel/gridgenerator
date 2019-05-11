// @ts-ignore
import badge_earlyadopter from "../../../assets/icons/profile-earlyadopter.svg";
// @ts-ignore
import badge_standardaccount from "../../../assets/icons/profile-payedaccount.svg";
import { IProfileForm } from "gridgenerator-data";
import { Button } from "../base/buttons";
import { Input, TextArea } from "../base/form";

export interface IProfileMeProps {
  className: string;
  titleClassName: string;
  subtitleClassName: string;
  profileId: number;
  profileAbout: string;
  profileName: string;
  profileCreated: string;
  profileForm: IProfileForm | null;
  isLoading: boolean;
  hasError: boolean;
  loadingMsg: string | null;
  badges: string[];
  onUpdate: (e: Event) => void;
}
const inputcx = "input-reset f6 ba b--black-20 br1 pa2 mb2 ml2 db w5";
const labelcx = "f6 b pa2 db tl";
const successCx = "dtc f7 pa2 tl green";
const errorCx = "dtc f7 pa2 tl red";
const neutralCx = "dtc f7 pa2 tl gray";
function renderBadges(badges: string[]) {
  const imgcx = "w2 h2";
  return (
    <div>
      <label className={labelcx}>Badges:</label>
      <div className="flex items-start justify-center">
        {badges.indexOf("earlyadopter") !== -1 ? (
          <img
            className={imgcx}
            src={badge_earlyadopter}
            alt="early adopter"
            title="Early Adopter"
          />
        ) : (
          <div />
        )}
        {badges.indexOf("supporter") !== -1 ? (
          <img
            className={imgcx}
            src={badge_standardaccount}
            alt="supporter"
            title="Supporter"
          />
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
export const ProfileMe = (props: IProfileMeProps) => (
  <section className={`ProfileMe user-select ${props.className}`}>
    <h1 className={props.titleClassName}>About me</h1>
    <h2 className={props.subtitleClassName}>Public Information</h2>
    <div className="pt4 pa5-ns pb0-ns flex flex-column items-start justify-center">
      {props.badges && props.badges.length > 0 ? (
        renderBadges(props.badges)
      ) : (
        <div />
      )}
      <label className={labelcx}>Others know me as:</label>
      <Input
        className={inputcx}
        type="text"
        placeholder={props.profileName}
        name="profile-name"
        id="profile-name"
        required
        disabled={props.isLoading}
        value={props.profileForm ? props.profileForm.name : props.profileName}
      />
      <label className={labelcx}>Bio:</label>
      <TextArea
        className={inputcx + " h4"}
        placeholder={props.profileAbout}
        name="profile-bio"
        id="profile-bio"
        disabled={props.isLoading}
        value={props.profileForm ? props.profileForm.about : null}
      />
      <div className="dt">
        <Button
          className="ml2 dtc"
          label="Update Profile"
          onAction={props.onUpdate}
          disabled={props.isLoading}
        />
        {props.isLoading ? (
          <p className={neutralCx}>Updating</p>
        ) : (
          <p className={props.hasError ? errorCx : successCx}>
            {props.loadingMsg}
          </p>
        )}
      </div>
    </div>
  </section>
);
