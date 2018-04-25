import { RGBColor } from '../color/rgb';

export const enum WheelMode {
	WHEEL_SATURATION_MODE = 2,
	WHEEL_HERING_MODE = 1,
	WHEEL_BRIGHTNESS_MODE = 0
}
export interface IWheelReviver {
	slices: number;
	selectedSlice: number;
	brightness: number;
	saturation: number;
	hering: number;
	colors: string[];
	heringColors: string[];
	heringSlice: number;
	brightnessColors: string[];
	brightnessOffset: number;
	saturationColors: string[];
	saturationOffset: number;
	mode: WheelMode;
}

export class Wheel {
	private _slices: number;
	private _selectedSlice: number;
	private _brightness: number;
	private _saturation: number;
	private _hering: number;
	private _colors: string[];
	private _heringColors: string[];
	private heringSlice: number;
	private _brightnessColors: string[];
	private _brightnessOffset: number;
	private _saturationColors: string[];
	private _saturationOffset: number;
	public readonly ringRatio1: number;
	public readonly ringRatio2: number;
	public readonly sliceCircleRatio1: number;
	public readonly sliceCircleRatio2: number;
	private _mode: WheelMode;
	constructor(angle: number = 0, light: number = 0.7, sat: number = 0.7) {
		this._slices = 16;
		this._selectedSlice = 0;
		// ^ 0 is horizontal right position, increases CW (down)
		// selectedSlice is always for the current mode and is
		// not changed between modes (values are adjusted to keep
		// the same position)
		this._brightness = 1.0;
		this._saturation = 1.0;
		this._hering = 0;
		// ^ 0 is horizontal right position, increases CW (down)
		this._colors = [];
		// ^ wheel colors:
		this._heringColors = [];
		this.heringSlice = 0;
		this._brightnessColors = [];
		this._brightnessOffset = 0;
		this._saturationColors = [];
		this._saturationOffset = 0;
		this._mode = WheelMode.WHEEL_HERING_MODE;
		this.ringRatio1 = 1 / 2.2;
		this.ringRatio2 = 1 / 3.45;
		this.sliceCircleRatio1 = 1 / 4;
		this.sliceCircleRatio2 = 2.25 / 4;
		this.updateHering(angle, light, sat);
	}
	public toJSON(): IWheelReviver {
		return {
			slices: this._slices,
			selectedSlice: this._selectedSlice,
			brightness: this._brightness,
			saturation: this._saturation,
			hering: this._hering,
			colors: this._colors.slice(0),
			heringColors: this._heringColors.slice(0),
			heringSlice: this.heringSlice,
			brightnessColors: this._brightnessColors.slice(0),
			brightnessOffset: this._brightnessOffset,
			saturationColors: this._saturationColors.slice(0),
			saturationOffset: this._saturationOffset,
			mode: this._mode
		};
	}
	public revive(obj: IWheelReviver) {
		this._slices = obj.slices;
		this._selectedSlice = obj.selectedSlice;
		this._brightness = obj.brightness;
		this._saturation = obj.saturation;
		this._hering = obj.hering;
		this._colors = obj.colors;
		this._heringColors = obj.heringColors;
		this.heringSlice = obj.heringSlice;
		this._brightnessColors = obj.brightnessColors;
		this._brightnessOffset = obj.brightnessOffset;
		this._saturationColors = obj.saturationColors;
		this._saturationOffset = obj.saturationOffset;
		this._mode = obj.mode;
		return this;
	}
	public getSelectedColor(): string {
		return this._colors[this._selectedSlice];
	}
	get slices(): number {
		return this._slices;
	}
	get selectedSlice(): number {
		return this._selectedSlice;
	}
	get brightness(): number {
		return this._brightness;
	}
	get saturation(): number {
		return this._saturation;
	}
	get hering(): number {
		return this._hering;
	}
	get colors(): string[] {
		return this._colors;
	}
	get mode(): WheelMode {
		return this._mode;
	}
	get heringColors(): string[] {
		return this._heringColors;
	}
	get brightnessColors(): string[] {
		return this._brightnessColors;
	}
	get brightnessOffset(): number {
		return this._brightnessOffset;
	}
	get saturationColors(): string[] {
		return this._saturationColors;
	}
	get saturationOffset(): number {
		return this._saturationOffset;
	}
	private _selectUnitValue(slice, value) {
		// calc the value at the new slice
		const sliceAngleDiff = (slice - this._selectedSlice) / this._slices;
		let newValue = (value + sliceAngleDiff);
		if (newValue > 1.0) {
			newValue = newValue - 1.0;
		} else if (newValue < 0) {
			newValue = newValue + 1.0;
		}
		return newValue;
	}
	private _adjustAngle(_angle) {
		let angle = _angle;
		if (_angle < 0) {
			// adjust to be positive
			angle = 2 * Math.PI + _angle;
		} else if (_angle > 2 * Math.PI) {
			// adjust to be under 2pi
			angle = _angle - 2 * Math.PI;
		}
		return angle;
	}
	// updates wheel to use brightness colors
	public updateBrightness(_angle: number, light: number, sat: number): Wheel {
		// const total = 360;
		// const deg = 1.0 / total;
		const selected = this._selectedSlice;
		const selectedColor = this.heringSlice;
		const slice = 1 / this._slices;
		const curAngle = Math.PI * 2 - _angle;
		const sliceAngle = this._adjustAngle(selectedColor * slice * Math.PI * 2);
		const colorAngle = this._adjustAngle(sliceAngle + curAngle);
		// Calculate the offset into the pre-rendered ring colors
		const offset = light * 360;
		// Calculate the slices colors
		const ammountUp = Math.ceil((1.0 - light) / slice);
		const ammountDown = Math.floor(light / slice);
		const colors = new Array(this._slices);
		for (let i = 0; i < ammountUp; i++) {
			let index = selected + i + 1;
			if (index >= this._slices) {
				index = index % this._slices;
			}
			const curLight = Math.min(light + (i + 1) * slice, 1.0);
			colors[index] = RGBColor.fromHering(colorAngle, curLight, sat);
		}
		for (let i = 0; i <= ammountDown; i++) {
			let index = selected - i;
			if (index < 0) {
				index = this._slices + index;
			}
			const curLight = light - (i * slice);
			colors[index] = RGBColor.fromHering(colorAngle, curLight, sat);
		}
		colors[selected] = RGBColor.fromHering(colorAngle, light, sat);
		// update this object
		this._brightness = light;
		this._saturation = sat;
		this._brightnessOffset = Math.round(offset);
		this._colors = colors;
		this._mode = WheelMode.WHEEL_BRIGHTNESS_MODE;
		return this;
	}
	// updates wheel to use saturated colors
	// color0 is the next color in saturation
	// and color359 is the previous color in saturation
	public updateSaturation(_angle: number, light: number, sat: number): Wheel {
		// const total = 180;
		// const deg = 1.0 / total;
		const selected = this._selectedSlice;
		const selectedColor = this.heringSlice;
		const slice = 1 / this._slices;
		const curAngle = (Math.PI * 2 - _angle);
		const sliceAngle = this._adjustAngle(selectedColor * slice * Math.PI * 2);
		const colorAngle = this._adjustAngle(sliceAngle + curAngle);
		// Calculate the ring colors offset
		const offset = sat * 360;
		// Calculate the slices colors
		const ammountUp = Math.ceil((1.0 - sat) / slice);
		const ammountDown = Math.floor(sat / slice);
		const colors = new Array(this._slices);
		for (let i = 0; i < ammountUp; i++) {
			let index = selected + i + 1;
			if (index >= this._slices) {
				index = index % this._slices;
			}
			const curSat = Math.min(sat + (i + 1) * slice, 1.0);
			colors[index] = RGBColor.fromHering(colorAngle, light, curSat);
		}
		for (let i = 0; i <= ammountDown; i++) {
			let index = selected - i;
			if (index < 0) {
				index = this._slices + index;
			}
			const curSat = sat - (i * slice);
			colors[index] = RGBColor.fromHering(colorAngle, light, curSat);
		}
		colors[selected] = RGBColor.fromHering(colorAngle, light, sat);
		// update and return this object
		this._brightness = light;
		this._saturation = sat;
		this._saturationOffset = Math.round(offset);
		this._colors = colors;
		this._mode = WheelMode.WHEEL_SATURATION_MODE;
		return this;
	}
	public selectSlice(slice: number): Wheel {
		if (this._mode === WheelMode.WHEEL_HERING_MODE) {
			this._selectedSlice = slice;
			this.heringSlice = slice;
			return this;
		} else if (this._mode === WheelMode.WHEEL_BRIGHTNESS_MODE) {
			const brightness = this._selectUnitValue(slice, this._brightness);
			this._selectedSlice = slice;
			return this.updateBrightness(this._hering, brightness, this._saturation);
		} else if (this._mode === WheelMode.WHEEL_SATURATION_MODE) {
			const sat = this._selectUnitValue(slice, this._saturation);
			this._selectedSlice = slice;
			return this.updateSaturation(this._hering, this._brightness, sat);
		}
		return this;
	}
	private static _heringColors(sat: number, light: number): string[] {
		return [
			RGBColor.fromHering(0, light, sat),
			RGBColor.fromHering(Math.PI / 2, light, sat),
			RGBColor.fromHering(Math.PI, light, sat),
			RGBColor.fromHering(3 * Math.PI / 2, light, sat)
		];
	}
	public updateHering(_angle: number, light: number, sat: number): Wheel {
		const angle = this._adjustAngle(_angle);
		const angles = [...Array(this._slices).keys()].map((a) => {
			let _calcAngle = a * 2 * Math.PI / (this._slices) - angle;
			if (_calcAngle < 0) {
				_calcAngle = 2 * Math.PI + _calcAngle;
			}
			if (_calcAngle >= Math.PI * 2) {
				return _calcAngle / Math.PI * 2;
			}
			return _calcAngle;
		});
		// update the hering colors and the color slices list
		this._hering = angle;
		this._brightness = light;
		this._saturation = sat;
		this._colors = angles.map((a) => RGBColor.fromHering(a, light, sat));
		this._heringColors = Wheel._heringColors(sat, light);
		this._mode = WheelMode.WHEEL_HERING_MODE;
		this.heringSlice = this._selectedSlice;
		return this;
	}
	public moveWheel(ammount: number): Wheel {
		if (this._mode === WheelMode.WHEEL_HERING_MODE) {
			return this.updateHering(ammount, this._brightness, this._saturation);
		} else if (this._mode === WheelMode.WHEEL_BRIGHTNESS_MODE) {
			return this.updateBrightness(this._hering, ammount, this._saturation);
		} else if (this._mode === WheelMode.WHEEL_SATURATION_MODE) {
			return this.updateSaturation(this._hering, this._brightness, ammount);
		}
		return this;
	}
	private static _getHSL(r: number, g: number, b: number) {
		const [h, s, l] = RGBColor.rgbToHsl(r, g, b);
		return { light: l, hering: RGBColor.heringFromHue(h), sat: s };
	}
	private static _getColorHSLFromHex(hex: string) {
		const [r, g, b] = RGBColor.hexToRgb(hex);
		return Wheel._getHSL(r, g, b);
	}
	private _getSelectedHSL() {
		const c = this._colors[this._selectedSlice];
		return Wheel._getColorHSLFromHex(c);
	}
	// adjusts the angle to put the selected hering color in
	// the current slice
	private _getAngleFor(hering: number): number {
		let angle = this._adjustAngle(hering);
		const sliceAngle = 2 * Math.PI / this._slices;
		// adjust angle to place the color in the selected position
		const diff = (sliceAngle * this._selectedSlice - angle);
		const isEqual = Math.abs(diff) < 0.005;
		if (isEqual) {
			angle = this._hering;
		} else {
			angle = diff;
		}
		return angle;
	}
	private _renderBrightnessWheel(): string[] {
		const _angle = this._hering;
		const total = 360;
		const deg = 1.0 / total;
		const selectedColor = this.heringSlice;
		const slice = 1 / this._slices;
		const curAngle = (Math.PI * 2 - _angle);
		const sliceAngle = this._adjustAngle(selectedColor * slice * Math.PI * 2);
		const colorAngle = this._adjustAngle(sliceAngle + curAngle);
		// Calculate the ring colors: one for each degree (0 to total [360])
		const bcolors: string[] = [];
		for (let i = 0; i < total; i++) {
			bcolors.push(RGBColor.fromHering(colorAngle, i * deg, this._saturation));
		}
		return bcolors;
	}
	private _renderSaturationWheel(): string[] {
		const _angle = this._hering;
		const total = 360;
		const deg = 1.0 / total;
		const selectedColor = this.heringSlice;
		const slice = 1 / this._slices;
		const curAngle = (Math.PI * 2 - _angle);
		const sliceAngle = this._adjustAngle(selectedColor * slice * Math.PI * 2);
		const colorAngle = this._adjustAngle(sliceAngle + curAngle);
		// Calculate the ring colors: one for each degree (0 to total [360])
		const scolors: string[] = [];
		for (let i = 0; i < total; i++) {
			scolors.push(RGBColor.fromHering(colorAngle, this._brightness, i * deg));
		}
		return scolors;
	}
	public changeMode(mode: WheelMode): Wheel {
		const w = this;
		let brightness = w._brightness;
		let saturation = w._saturation;
		let angle = w._hering;
		if (mode === WheelMode.WHEEL_HERING_MODE) {
			if (w._mode === WheelMode.WHEEL_BRIGHTNESS_MODE
			|| w._mode === WheelMode.WHEEL_SATURATION_MODE) {
				// adjust brightness
				const hsl = this._getSelectedHSL();
				brightness = hsl.light;
				saturation = hsl.sat;
				angle = this._getAngleFor(hsl.hering);
			}
			return this.updateHering(angle, brightness, saturation);
		} else if (mode === WheelMode.WHEEL_BRIGHTNESS_MODE) {
			this._brightnessColors = this._renderBrightnessWheel();
			return this.updateBrightness(
				this._hering, this._brightness, this._saturation
			);
		} else if (mode === WheelMode.WHEEL_SATURATION_MODE) {
			this._saturationColors = this._renderSaturationWheel();
			return this.updateSaturation(
				w._hering, w._brightness, w._saturation
			);
		}
		return this;
	}
	public fromHex(hex: string): Wheel {
		// calculate hering, brightness and saturation from hex
		const hsl = Wheel._getColorHSLFromHex(hex);
		const angle = this._getAngleFor(hsl.hering);
		return this.updateHering(angle, hsl.light, hsl.sat);
	}
	public fromColor(c: RGBColor): Wheel {
		// calculate hering, brightness and saturation from hex
		const { light, hering, sat } = Wheel._getHSL(c.r, c.g, c.b);
		const angle = this._getAngleFor(hering);
		return this.updateHering(angle, light, sat);
	}
	public toColor() {
		return RGBColor.fromHex(this._colors[this._selectedSlice]);
	}
}
