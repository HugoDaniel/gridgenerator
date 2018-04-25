export class FatActionSets {
	public sitePlayerActions: Set<string>;
	public undoActions: Set<string>;
	constructor() {
		this.sitePlayerActions = new Set([
			/*
			'hudEnterNewShape',
			'hudDiscardNewShape',
			'hudSaveShape',
			'hudSelectShape',
			'hudRotateShape',
			'hudSelectFill',
			'hudClearAll',
			'shapeSelectTemplate',
			'shapeClose',
			'shapePointAction',
			'shapeReverseTo',
			'shapeSolveAmbiguity',
			'shapeDeleteFigure',
			*/
			'scenePaint',
			'sceneDelete'
		]);
		this.undoActions = new Set([

		]);
	}
}
