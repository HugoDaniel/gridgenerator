// @ts-ignore
import pricing_basic from '../../../assets/icons/pricing-features.svg';
// @ts-ignore
import pricing_enterprise from '../../../assets/icons/pricing-integration.svg';
// @ts-ignore
import pricing_standard from '../../../assets/icons/product-shirt.svg';
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
	// The Grid Generator app is tailored to encourage you to share your works under Free Cultural Works compatible licenses and remix other works from the community.
	return (
		<MeanderWrapper className="MeanderPricing" title="Pricing" onExit={props.onExit}>
			<div
				className="h-100 ttn center bl br b--light-gray bg-meander"
				style={{ 'max-width': '52rem' }}
				onClick={(e: Event) => e.stopImmediatePropagation()}
			>
				<div className={props.sectionClassName}>
					<h1 className={props.titleClassName}>Do more with Grid Generator</h1>
					<h2 className={props.subtitleClassName}>And help develop the app further.</h2>
					<div className="contact-social flex flex-wrap">
						<PricingCard
							className={cardCx}
							imgUrl={pricing_basic}
							name="Export"
							title1="Use anywhere you want"
							subtitle1="€4.69 per project"
							desc="Save it as SVG, PNG or export your creation process as an MP4 or GIF animation"
							>
							<ul className="list pl1">
								<PricingItem>Vector Image (SVG)</PricingItem>
								<PricingItem>Raster Image (PNG)</PricingItem>
								<PricingItem>Automatic records your creation process</PricingItem>
								<PricingItem>Creation animation (MP4)</PricingItem>
								<PricingItem>Creation GIF</PricingItem>
							</ul>
						</PricingCard>
						<PricingCard
							className={cardCx}
							imgUrl={pricing_standard}
							name="Make products"
							title1="Bring your creation to life"
							subtitle1="(upcoming)"
							desc="Create your shapes and patterns and turn them into products. "
							>
							<ul className="list pl1">
								<PricingItem><b>Buy customized products with your creations</b></PricingItem>
								<PricingItem>Order your custom T-Shirts</PricingItem>
								<PricingItem>Order custom Tote Bags</PricingItem>
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
