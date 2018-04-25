// @ts-ignore
import pricing_basic from '../../../assets/icons/pricing-feather.svg';
// @ts-ignore
import pricing_ok from '../../../assets/icons/pricing-ok.svg';
// @ts-ignore
import pricing_enterprise from '../../../assets/icons/pricing-pen.svg';
// @ts-ignore
import pricing_standard from '../../../assets/icons/pricing-pencil.svg';
import { Button } from '../base/buttons';
import { IPricingCardProps, PricingCard } from './pricing_card';
import { IMeanderWrapperProps, MeanderWrapper } from './wrapper';
export interface IMeanderPricingProps extends IMeanderWrapperProps {
	sectionClassName: string;
	titleClassName: string;
	textClassName: string;
	subtitleClassName: string;
	onBuyAction: () => void;
}
const PricingItem = (props) =>
	<li className="list-item f7 h2 flex items-center justify-left mv1">
		<img className="w1 h1 mr2" src={pricing_ok} alt="Feature:"/>
		<p className="tl">
			{props.children}
		</p>
	</li>;

export function MeanderPricing(props: IMeanderPricingProps) {
	const cardCx = '';
	return (
		<MeanderWrapper className="MeanderPricing" title="Pricing" onExit={props.onExit}>
			<div
				className="h-100 ttn center bl br b--light-gray bg-meander"
				style={{ 'max-width': '52rem' }}
				onClick={(e: Event) => e.stopImmediatePropagation()}
			>
				<div className={props.sectionClassName}>
					<h1 className={props.titleClassName}>Do more with Grid Generator</h1>
					<h2 className={props.subtitleClassName}>Here are our plans</h2>
					<div className="contact-social flex flex-wrap">
						<PricingCard
							className={cardCx}
							imgUrl={pricing_basic}
							name="Basic"
							title1="Free"
							subtitle1="Forever"
							desc="Our initial plan for all users. You can export your works as long as you share them under a Free Cultural Works compatible license."
							>
							<ul className="list pl1">
								<PricingItem>Infinite Grid</PricingItem>
								<PricingItem>Replay your works</PricingItem>
								<PricingItem>3 Shape Templates</PricingItem>
								<PricingItem>Share with Free Cultural Works compatible licenses (CC0, BY, BY-SA)</PricingItem>
								<PricingItem>Export as SVG after sharing</PricingItem>
							</ul>
						</PricingCard>
						<PricingCard
							className={cardCx}
							imgUrl={pricing_standard}
							name="Standard"
							title1="€15"
							subtitle1="Per month when billed yearly (€18 when billed monthly)"
							desc="Fine tune how your work is shared. Export freely without restrictions."
							>
							<ul className="list pl1">
								<PricingItem><b>Everything in Basic</b></PricingItem>
								<PricingItem>Share with any Creative Commons License</PricingItem>
								<PricingItem>Export as SVG without having to share</PricingItem>
							</ul>
							<Button
								label="Upgrade now"
								onAction={props.onBuyAction}
							/>
						</PricingCard>
						<PricingCard
							className={cardCx}
							imgUrl={pricing_enterprise}
							name="Enterprise"
							title1="Contact us"
							subtitle1="Monthly rates + setup fee"
							desc="Customized solution for your business. Allow your clients to create shapes and patterns that fit into your products. Contact us for details."
						>
							<ul className="list pl1">
								<PricingItem><b>Everything in Standard</b></PricingItem>
								<PricingItem>Use your domain</PricingItem>
								<PricingItem>Advanced training for your end users and admins</PricingItem>
							</ul>
						</PricingCard>
					</div>
				</div>
			</div>
		</MeanderWrapper>
	);
}
