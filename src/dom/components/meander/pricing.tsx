// @ts-ignore
import pricing_basic from '../../../assets/icons/pricing-features.svg';
// @ts-ignore
import pricing_enterprise from '../../../assets/icons/pricing-integration.svg';
// @ts-ignore
import pricing_standard from '../../../assets/icons/pricing-money.svg';
// @ts-ignore
import pricing_ok from '../../../assets/icons/pricing-ok.svg';
import { Button } from '../base/buttons';
import { IPricingCardProps, PricingCard } from './pricing_card';
import { IMeanderWrapperProps, MeanderWrapper } from './wrapper';
export interface IMeanderPricingProps extends IMeanderWrapperProps {
	sectionClassName: string;
	titleClassName: string;
	textClassName: string;
	subtitleClassName: string;
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
					<h1 className={props.titleClassName}>Do it with Grid Generator</h1>
					<h2 className={props.subtitleClassName}>Business related information</h2>
					<div className="contact-social flex flex-wrap">
						<PricingCard
							className={cardCx}
							imgUrl={pricing_basic}
							name="Features"
							title1="Free & 100% Open Source"
							subtitle1="No monthly subscription. No extra/hidden costs."
							desc="The Grid Generator app is tailored to encourage you to share your works under Free Cultural Works compatible licenses and remix other works from the community."
							>
							<ul className="list pl1">
								<PricingItem>Infinite Grid</PricingItem>
								<PricingItem>Automatic tile patterns</PricingItem>
								<PricingItem>Replay your works</PricingItem>
								<PricingItem>3 Shape Templates (more to come)</PricingItem>
								<PricingItem>Share & Remix with Free Cultural Works compatible licenses (CC0, BY, BY-SA)</PricingItem>
								<PricingItem>Export as SVG</PricingItem>
							</ul>
						</PricingCard>
						<PricingCard
							className={cardCx}
							imgUrl={pricing_standard}
							name="Money"
							title1="How to support this project"
							subtitle1="Use it to make your customized products"
							desc="Create your shapes and patterns and turn them into products. When you buy a poster or t-shirt you are helping me develop the app further by removing bugs and create new features."
							>
							<ul className="list pl1">
								<PricingItem><b>Buy customized products with your shapes and patterns</b></PricingItem>
								<PricingItem>Order your custom T-Shirts</PricingItem>
								<PricingItem>Order custom Posters</PricingItem>
							</ul>
						</PricingCard>
						<PricingCard
							className={cardCx}
							imgUrl={pricing_enterprise}
							name="Integration"
							title1="Adapt to your business"
							subtitle1="Monthly rates + setup fee"
							desc="Customized solution for your business. Allow your clients to create shapes and patterns that fit into your products. Send an e-mail for further details."
						>
							<ul className="list pl1">
								<PricingItem><b>Adapt the tool to your desire</b></PricingItem>
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
