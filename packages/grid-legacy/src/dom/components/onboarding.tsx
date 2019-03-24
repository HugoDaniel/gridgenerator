import { Onboarding, OnboardingAt } from '../../data';
import { Button } from './base/buttons';

export interface IOnboardingProps {
	className?: string;
	data: Onboarding;
}
function onboardingStart(props: IOnboardingProps) {
	return (
		<section className={`Onboarding z-3 bg-near-white absolute w-100 h-100 top-0 left-0 bg-dark-gray near-white sans-serif flex items-center justify-center ${props.className || ''}`}>
			<div className="at-start bg-near-black w5 h5 center pa3 flex items-center justify-center">
				<p className="pa3 ttu">Welcome to <span className="b">Grid Generator</span></p>
			</div>
		</section>
	);
}
function renderOnboarding(props: IOnboardingProps) {
	switch (props.data.at) {
		case OnboardingAt.Start:
		return onboardingStart(props);
		default:
		return <div />;
	}
}
export const OnboardingPanel = (props: IOnboardingProps) => {
	return renderOnboarding(props);
};
