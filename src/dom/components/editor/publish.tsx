// @ts-ignore
import cc from '../../../assets/icons/license-cc.svg';
// @ts-ignore
import cc0 from '../../../assets/icons/license-cc0.svg';
// @ts-ignore
import ccby from '../../../assets/icons/license-ccby.svg';
// @ts-ignore
import ccnc from '../../../assets/icons/license-ccnc.svg';
// @ts-ignore
import ccnd from '../../../assets/icons/license-ccnd.svg';
// @ts-ignore
import ccsa from '../../../assets/icons/license-ccsa.svg';
import { PublishAt, PublishState, UIPublishEditor } from '../../../data';
import { PublishEvents } from '../../events/publish_events';
import { Button } from '../base/buttons';
import { Input, TextArea } from '../base/form';
import { LicenseDesc } from './publish/license_desc';
import { LicenseImg } from './publish/license_img';
export interface IPublishProps {
	className?: string;
	events: PublishEvents;
	data: UIPublishEditor;
	height?: number;
	onExit: () => void;
	isPaidAccount: boolean;
}
function renderLicenseBadge(isAvailable: boolean, cx: string, logo: string, title: string, onAction: (e: Event) => void, isSelected: boolean, desc?: string) {
	return (
		<a
			className={`link pointer ${isAvailable ? 'dim' : 'o-20'} flex items-center lh-copy pa3 ph0-l bb b--black-10 ${cx}`}
			onClick={isAvailable ? onAction : null}
		>
			<img className={`w2 h2 w3-ns h3-ns br-100 transition-o ${isSelected ? 'o-100' : 'o-40'}`} src={logo} />
      <div className="pl3 flex-auto">
        <span className="f6 db black-70">{title}</span>
        <span className="f7 db black-70">{desc ? desc : ''}</span>
      </div>
      <div>
      </div>
  </a>
	);
}
function renderLicense(props: IPublishProps) {
	const license = new Set(props.data.license.split('_'));
	return (
		<section className="w-100 flex flex-column items-center justify-start h-100 overflow-auto pt4">
		<h2 className="mt0">
			{ props.data.title ? `License for ${props.data.title}` : `Change license` }
		</h2>
		<ul class="list pl0 mt0 measure center">
			{renderLicenseBadge(true, '', cc0, 'Public Domain', props.events.onLicenseCC0, license.has('CC0'))}
			{renderLicenseBadge(true, '', cc, 'Creative Commons', props.events.onLicenseCCBY, license.has('BY'))}
			{renderLicenseBadge(true, 'ml4', ccby, 'Attribution', props.events.onLicenseCCBY, license.has('BY'), 'Others must give appropriate credit, provide a link to the license, and indicate if changes were made.')}
			{renderLicenseBadge(true, 'ml4', ccsa, 'Share Alike', props.events.onLicenseCCSA, license.has('SA'), ' If someone remixes, transforms, or builds upon this material, they must distribute their contributions under the same license as the original.')}
			{renderLicenseBadge(props.isPaidAccount, 'ml4', ccnc, 'Non Commercial', props.events.onLicenseCCNC, license.has('NC'), 'Others may not use the material for commercial purposes.')}
			{renderLicenseBadge(props.isPaidAccount, 'ml4', ccnd, 'No Derivatives', props.events.onLicenseCCND, license.has('ND'), 'If others remix, transform, or build upon this material, they may not distribute the modified material.')}
		</ul>
		<div className="mt4 w5 flex items-center justify-center">
		<Button
			id={props.data}
			className="mh2 mb4"
			label="Done"
			onAction={props.events.exitLicense}
		/>
		</div>
		</section>
	);
}
function renderMetadata(props: IPublishProps) {
	const inputcx = 'input-reset f6 ba b--black-20 br1 pa2 mb2 db w-100';
	const isLoading = props.data.state === PublishState.Loading;
	const events = {
		onPublish: props.events.onPublish,
		enterLicense: props.events.enterLicense,
		onExit: props.onExit
	};
	if (isLoading) {
		const nop = () => null;
		events.onPublish = nop;
		events.enterLicense = nop;
		events.onExit = nop;
	}
	const subtitleCx = 'mv1';
	return (
		<section className="w-100 flex flex-column items-center justify-center">
		<h2 className="mv0">
			Publish
		</h2>
		<h3 className="mv0 f5">
			And share with your friends
		</h3>
		<div className="mt3 w-100 bt bb bg-white flex flex-column items-center justify-center">
			<h4 className={`mt4 mb1`}>
				Title
			</h4>
			<div className="flex items-center justify-center gray">
				<Input id="publish-title" className={inputcx} placeholder="Name of this project" defaultValue={props.data.title} value={props.data.title} disabled={isLoading}/>
			</div>
			<h4 className={subtitleCx}>
				Description
			</h4>
			<div className="flex items-center justify-center gray">
				<TextArea id="publish-desc" className={inputcx + ' h3 h4-ns'} defaultValue={props.data.desc} value={props.data.desc} disabled={isLoading} />
			</div>
			<h4 className={subtitleCx}>
				License
			</h4>
			<div className="flex flex-column items-center justify-center gray">
				<LicenseImg license={props.data.license} onAction={events.enterLicense} />
				<LicenseDesc className="f7 dark-gray mw5 mt2 tj pa0" license={props.data.license} />
			</div>
		</div>
		<div className="mt4 w5 flex items-center justify-center">
			<Button
				className="mh2"
				bg="transparent"
				color="dark-gray"
				label="Cancel"
				disabled={isLoading}
				onAction={events.onExit}
				/>
			<Button
				id={props.data}
				className="mh2"
				label={`Publish`}
				disabled={isLoading}
				onAction={events.onPublish}
			/>
		</div>
	</section>
	);
}
export const Publish = (props: IPublishProps) => {
	return (
<div
	style={{ height: props.height }}
	className={`PublishEditor ${props.className || ''}
	flex justify-center items-center editormw editor-shadow sans-serif h-100`}
>
	{ props.data.at === PublishAt.Metadata
	? renderMetadata(props) : renderLicense(props)
	}
</div>);
};
