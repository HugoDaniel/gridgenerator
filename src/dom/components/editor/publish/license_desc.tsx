
export interface ILicenseDescProps {
	license: string;
	className?: string;
}
export const LicenseDesc = (props: ILicenseDescProps) => {
	switch (props.license) {
		case 'BY':
			return (
			<p className={`LicenseDesc ${props.className || ''}`}>
				Others may copy, distribute, display and perform the work and make derivative works and remixes based on this work only if they give the author the credits (<a className="link dim" href="https://en.wikipedia.org/wiki/Creative_Commons_license#Attribution" target="_blank">attribution</a>) in the manner specified by these.
			</p>);
		case 'BY_SA':
			return (
			<p className={`LicenseDesc ${props.className || ''}`}>
				Others may copy, distribute, display and perform the work and make derivative works and remixes based on this work only if they give the author the credits (<a className="link dim" href="https://en.wikipedia.org/wiki/Creative_Commons_license#Attribution" target="_blank">attribution</a>) in the manner specified by these and
			  the distribution of derivative works is under a license identical ("not more restrictive") to the license that governs this work.
			</p>);
		case 'BY_NC':
			return (
			<p className={`LicenseDesc ${props.className || ''}`}>
				Others may copy, distribute, display and perform the work and make derivative works and remixes based on this work only for non-commercial purposes and if they give the author the credits (<a className="link dim" href="https://en.wikipedia.org/wiki/Creative_Commons_license#Attribution" target="_blank">attribution</a>).
			</p>);
		case 'BY_ND':
		return (
			<p className={`LicenseDesc ${props.className || ''}`}>
				Others may copy, distribute, display and perform only verbatim copies of the work and only if they give the author the credits (<a className="link dim" href="https://en.wikipedia.org/wiki/Creative_Commons_license#Attribution" target="_blank">attribution</a>). Derivative works and remixes based on it are not allowed.
			</p>);
		case 'BY_NC_SA':
		return (
			<p className={`LicenseDesc ${props.className || ''}`}>
				Others may copy, distribute, display and perform the work and make derivative works and remixes based on this work only for non-commercial purposes and if they give the author the credits (<a className="link dim" href="https://en.wikipedia.org/wiki/Creative_Commons_license#Attribution" target="_blank">attribution</a>) and the distribution of derivative works is under a license identical ("not more restrictive") to the license that governs this work.
			</p>);
		case 'BY_NC_ND':
			return (
			<p className={`LicenseDesc ${props.className || ''}`}>
				Others may copy, distribute, display and perform only verbatim copies of the work and only for non-commercial purposes and only if they give the author the credits (<a className="link dim" href="https://en.wikipedia.org/wiki/Creative_Commons_license#Attribution" target="_blank">attribution</a>). Derivative works and remixes based on it are not allowed.
			</p>);
		default: // CC0
			return (
			<p className={`LicenseDesc ${props.className || ''}`}>
				Globaly free for any use without restrictions
			</p>);
	}
};
