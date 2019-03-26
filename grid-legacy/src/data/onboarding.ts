export enum OnboardingAt { Start = 100, AddShape, AddFills, ChangeShape, End }
export class Onboarding {
	public at: OnboardingAt;
	constructor() {
		this.at = OnboardingAt.Start;
	}
	public next() {
		if (this.at !== OnboardingAt.End) {
			this.at = this.at++;
		}
	}
	public finish() {
		this.at = OnboardingAt.End;
	}
}
