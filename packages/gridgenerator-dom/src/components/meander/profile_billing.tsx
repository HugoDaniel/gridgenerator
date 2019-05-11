import { Component, linkEvent } from 'inferno';
// @ts-ignore
import badge_earlyadopter from '../../../assets/icons/profile-earlyadopter.svg';
// @ts-ignore
import badge_standardaccount from '../../../assets/icons/profile-payedaccount.svg';
import { Countries, MeanderProfile, ProfileBillingAt, ProfileBillingFreq, ProfileStatus, IBillingInvoice } from '../../../data';
import { Button } from '../base/buttons';
import { Input, TextArea } from '../base/form';
export interface IProfileBillingProps {
	className: string;
	titleClassName: string;
	subtitleClassName: string;
	isLoading: boolean;
	hasError: boolean;
	loadingMsg: string | null;
	profile: MeanderProfile;
	onPaymentFreqChange: (opt: ProfileBillingFreq) => void;
	onBillingExpand: () => void;
	onBillingCheckout: () => void;
	onBillingDone: () => void;
}
function renderBillingInfo(p: MeanderProfile, subtitleClassName: string, withExpand: boolean, onBillingExpand: () => void) {
	const labelcx = 'f6 b pa2 db tl';
	const inputcx = 'input-reset f6 ba b--black-20 br1 pa2 mb2 ml2 db w5';
	return (
		<div className="bl-ns b--light-gray flex flex-column items-center justify-center mb3">
			<h2 className={subtitleClassName + ' mb3'}>Invoices info (optional)</h2>
			<Input className={inputcx} id="email" type="email" placeholder="Billing E-mail" value={p.billingEmail} />
			{ withExpand ?
			<Button
				className="mr0-ns blue b--blue"
				bg="white"
				label="Add More Information"
				onAction={onBillingExpand}
			/>
			: <div className="">
				<label className={labelcx}>
					Billing Country
				</label>
				<select id="country" className={inputcx}>
					{ Countries.map((c) =>
						<option value={c.code}>{c.name}</option>
					)}
				</select>
				<Input className={inputcx} id="company" placeholder="Company Name" />
				<Input className={inputcx} id="vatid" placeholder="VAT ID" />
				<label className={labelcx}>
					Billing Address
				</label>
				<Input className={inputcx} id="postal" placeholder="Postal Code" />
				<TextArea className={inputcx} id="street" placeholder="Full Address" />
				</div>
			}
		</div>
	);
}
function renderBillingCheckout(props: IProfileBillingProps) {
	return (
		<div>
			{ props.isLoading
			? <h2 className={props.subtitleClassName}>Loading</h2>
			:
			<div>
				<h2 className={props.subtitleClassName}>Payment frequency</h2>
				<div className="flex items-center justify-center gray mt3">
					<a onClick={linkEvent(ProfileBillingFreq.Yearly, props.onPaymentFreqChange)} className={`f6 link dim ttu dark-gray mh2 pointer ${props.profile.billingFreq === ProfileBillingFreq.Yearly ? 'underline b' : ''}`}>€180 (yearly)</a>
					<p className="f7 mh3 mv0">or</p>
					<a onClick={linkEvent(ProfileBillingFreq.Monthly, props.onPaymentFreqChange)} className={`f6 link dim ttu dark-gray mh2 pointer ${props.profile.billingFreq === ProfileBillingFreq.Monthly ? 'underline b' : ''}`}>€18 (monthly)</a>
				</div>
			</div>
			}
			<div className="ph5-ns pb0-ns transition-o o-100 flex flex-column items-center justify-center">
				<div id="braintree-container" />
			</div>
				{ props.isLoading ? <div /> :
					<div className="flex-ns flex-row-reverse-ns items-start justify-between ph5-ns">
						{renderBillingInfo(props.profile, props.subtitleClassName, props.profile.billingAt === ProfileBillingAt.CheckoutInfo, props.onBillingExpand)}
						<div className="flex flex-column items-start">
							<p className="f5 ttu black b">Total: {props.profile.billingFreq === ProfileBillingFreq.Yearly ? '€180' : '€18'}</p>
							<Button
								label={props.profile.loadingStatus === ProfileStatus.Loading
									? 'Processing' : 'Checkout'}
								disabled={props.profile.loadingStatus === ProfileStatus.Loading}
								onAction={props.onBillingCheckout}
								/>
							<p className="h2 f7 red">{props.profile.billingError}</p>
						</div>
					</div>
				}
			</div>
	);
}
function renderInvoice(i: IBillingInvoice) {
	return (
		<div className="w5 ph2 flex items-start justify-between ba br2 b--gray dim">
			<p className="f6 black">{i.date}</p>
			<p className="f6 gray">{`${i.currency} ${i.ammount / 100}`}</p>
			<p className="f6 black b ttu">{i.status}</p>
		</div>
	);
}
function renderBillingHistory(props: IProfileBillingProps) {
	return (
		<div className="">
			<h2 className={props.subtitleClassName + ' mb3'}>Invoices</h2>
			<nav className="flex items-center justify-center">
				{props.profile.billingInvoices.map(renderInvoice)}
			</nav>
		</div>
	);
}
export class ProfileBilling extends Component<IProfileBillingProps, any> {
	public componentDidMount() {
		//
	}
	public render() {
		const props = this.props;
		return (
			props.profile.billingAt === ProfileBillingAt.CheckoutThankYou ?
			<section
			className={`ProfileBilling user-select ${props.className}`}
			>
				<h1 className={props.titleClassName}>Thank you!</h1>
				<div className="badges mt4">
					<img className="w3 h3" src={badge_standardaccount} alt="Payed Account" title="Payed Account" />
					<img className="w3 h3" src={badge_earlyadopter} alt="Early Adopter" title="Early Adopter" />
				</div>
				<Button
					label="Let's do something cool"
					onAction={props.onBillingDone}
				/>
			</section>
			:
			<section
			className={`ProfileBilling user-select ${props.className}`}
			>
				<h1 className={props.titleClassName}>Billing</h1>
				{ props.profile.billingAt === ProfileBillingAt.History
				? renderBillingHistory(props)
				: renderBillingCheckout(props)
				}
			</section>
		);
	}
}
