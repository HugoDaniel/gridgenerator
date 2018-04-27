export interface ToolsSubmenusReviver {
	p: boolean;
	pv: boolean;
}
export class ToolsSubmenus {
	public isPatternToggled: boolean;
	public isPatternVisible: boolean;
	constructor() {
		this.isPatternToggled = false;
		this.isPatternVisible = false;
	}
	public toJSON(): ToolsSubmenusReviver {
		return {
			p: this.isPatternToggled,
			pv: this.isPatternVisible
		};
	}
	public static revive(o: ToolsSubmenusReviver) {
		const result = new ToolsSubmenus();
		result.isPatternToggled = o.p;
		result.isPatternVisible = o.pv;
		return result;
	}
}
