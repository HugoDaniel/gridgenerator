// @ts-ignore
import cc0_mark from "../../../../assets/icons/license-cc0-mark.svg";
// @ts-ignore
import ccby_mark from "../../../../assets/icons/license-ccby-mark.svg";
// @ts-ignore
import ccbync_mark from "../../../../assets/icons/license-ccbync-mark.svg";
// @ts-ignore
import ccbyncnd_mark from "../../../../assets/icons/license-ccbyncnd-mark.svg";
// @ts-ignore
import ccbyncsa_mark from "../../../../assets/icons/license-ccbyncsa-mark.svg";
// @ts-ignore
import ccbynd_mark from "../../../../assets/icons/license-ccbynd-mark.svg";
// @ts-ignore
import ccbysa_mark from "../../../../assets/icons/license-ccbysa-mark.svg";

export interface ILicenseImgProps {
  license: string;
  onAction?: (e: Event) => void;
  link?: boolean;
  className?: string;
}
export const LicenseImg = (props: ILicenseImgProps) => {
  const acx = `link dim pointer ${props.className || ""}`;
  switch (props.license) {
    case "BY":
      return (
        <a
          rel="license"
          className={acx}
          onClick={props.onAction}
          href={
            props.link
              ? "https://creativecommons.org/licenses/by/4.0/legalcode"
              : "#"
          }
          target={props.link ? "_blank" : ""}
        >
          <img className="h2" src={ccby_mark} alt="CC BY-Logo" />
        </a>
      );
    case "BY_SA":
      return (
        <a
          rel="license"
          className={acx}
          onClick={props.onAction}
          href={
            props.link
              ? "https://creativecommons.org/licenses/by-sa/4.0/legalcode"
              : ""
          }
          target={props.link ? "_blank" : ""}
        >
          <img className="h2" src={ccbysa_mark} alt="CC BY-Logo" />
        </a>
      );
    case "BY_NC":
      return (
        <a
          rel="license"
          className={acx}
          onClick={props.onAction}
          href={
            props.link
              ? "https://creativecommons.org/licenses/by-nc/4.0/legalcode"
              : ""
          }
          target={props.link ? "_blank" : ""}
        >
          <img className="h2" src={ccbync_mark} alt="CC BY-Logo" />
        </a>
      );
    case "BY_ND":
      return (
        <a
          rel="license"
          className={acx}
          onClick={props.onAction}
          href={
            props.link
              ? "https://creativecommons.org/licenses/by-nd/4.0/legalcode"
              : ""
          }
          target={props.link ? "_blank" : ""}
        >
          <img className="h2" src={ccbynd_mark} alt="CC BY-Logo" />
        </a>
      );
    case "BY_NC_SA":
      return (
        <a
          rel="license"
          className={acx}
          onClick={props.onAction}
          href={
            props.link
              ? "https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode"
              : ""
          }
          target={props.link ? "_blank" : ""}
        >
          <img className="h2" src={ccbyncsa_mark} alt="CC BY-Logo" />
        </a>
      );
    case "BY_NC_ND":
      return (
        <a
          rel="license"
          className={acx}
          onClick={props.onAction}
          href={
            props.link
              ? "https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode"
              : ""
          }
          target={props.link ? "_blank" : ""}
        >
          <img className="h2" src={ccbyncnd_mark} alt="CC BY-Logo" />
        </a>
      );
    default:
      return (
        <a
          rel="license"
          className={acx}
          onClick={props.onAction}
          href={
            props.link
              ? "https://creativecommons.org/publicdomain/zero/1.0/legalcode"
              : ""
          }
          target={props.link ? "_blank" : ""}
        >
          <img className="h2" src={cc0_mark} alt="Public Domain Logo" />
        </a>
      );
  }
};
