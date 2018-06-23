import { ExportAt, FatState, ProjectMap, UIExportEditor } from '../../data';
import { Net, Runtime } from '../../engine';
import { Movement } from '../../engine/runtime/movement';
import { downloadFile, IEventHandler, loadScript } from '../common';
import { Refresher } from './refresher';
declare let paypal: any;
export class ExportEvents implements IEventHandler {
	public runtime: Runtime;
	public state: FatState;
	public net: Net;
	public projects: ProjectMap;
	public refresher: Refresher;
	public onExportInit: () => void;
	public onFormatChange: (fmt: number, e: Event) => void;
	public onSizeChange: (size: number, e: Event) => void;
	public onPatternChange: (e: Event) => void;
	public onExport: (e?: Event) => void;
	public onChangeToImage: (e: Event) => void;
	public onChangeToVideo: (e: Event) => void;
	public loadPaypal: () => void;
	// event handler:
	public onMouseDown: (e: MouseEvent) => void;
	public onMouseMove: (e: MouseEvent) => void;
	public onMouseUp: (e: MouseEvent) => void;
	public onTouchStart: (e: TouchEvent) => void;
	public onTouchMove: (e: TouchEvent) => void;
	public onTouchEnd: (e: TouchEvent) => void;
	public onTouchCancel: (e: TouchEvent) => void;
	constructor(rt: Runtime, s: FatState, n: Net, p: ProjectMap, refresher: Refresher) {
		this.runtime = rt;
		this.state = s;
		this.refresher = refresher;
		this.net = n;
		this.projects = p;
		this.loadPaypal = () => {
			if (!this.runtime.token) {
				// GOTO LOGIN
			} else {
				loadScript('https://www.paypalobjects.com/api/checkout.js', 'gg-paypal-checkout').then(() => {
					if (paypal) {
						paypal.Button.render({
							env: process.env.PAYPAL_ENV, // Or 'sandbox',
							commit: true, // Show a 'Pay Now' button
							style: {
								color: 'gold',
								size: 'small'
							},
							client: {
								sandbox:	process.env.PAYPAL_CLIENTID,
								production:	process.env.PAYPAL_CLIENTID
							},
							payment: (data, actions) => {
								return actions.payment.create({
									payment: {
											transactions: [{
												amount: { total: '4.69', currency: 'EUR' }
											}]
									}
								});
							},
							onAuthorize: (data, actions) => {
								return actions.payment.execute().then((payment) => {
									// The payment is complete!
									// You can now show a confirmation message to the customer
									console.log('PAYMENT DONE', payment, 'THIS:', this, 'DATA', data);
									this.projects.exportCurrent().then((proj) =>
										this.net.export.postExportPayment(this.runtime.token, payment, proj)
									);
								});
							},
							onCancel(data, actions) {
								/*
								 * Buyer cancelled the payment
								 */
							},
							onError(err) {
								/*
								 * An error occurred during the transaction
								 */
							}
						}, '#paypal-button');
					}
				}, (error) => {
					console.log('ERROR LOADING PAYPAL', error);
				});
			}
		};
		this.onExportInit = () => {
			this.state.exportImagePreview();
			this.refresher.refreshStateAndDOM(this.state);
		};
		this.onChangeToImage = (e: Event) => {
			e.preventDefault();
			this.state.exportChangeTo(ExportAt.Image);
			this.refresher.refreshStateAndDOM(this.state);
		};
		this.onChangeToVideo = (e: Event) => {
			e.preventDefault();
			this.state.exportChangeTo(ExportAt.Video);
			this.refresher.refreshStateAndDOM(this.state);
		};
		this.onFormatChange = (fmt, e) => {
			e.preventDefault();
			this.state = this.state.exportFormatChange(fmt);
			this.refresher.refreshStateAndDOM(this.state);
		};
		this.onSizeChange = (size, e) => {
			e.preventDefault();
			this.state = this.state.exportSizeChange(size);
			this.refresher.refreshStateAndDOM(this.state);
		};
		this.onPatternChange = (e) => {
			e.preventDefault();
			const t = e.target as HTMLInputElement;
			if (t) {
				const value = parseFloat(t.value);
				if (!isNaN(value)) {
					this.state = this.state.exportPatternChange(value);
					this.refresher.refreshStateAndDOM(this.state);
				}
			}
		};
		this.onExport = (e) => {
			if (e) {
				e.preventDefault();
			}
			const res = this.state.current.ui.exportEditor.calcres();
			if (this.state.current.ui.exportEditor.dim) {
				const svg = this.state.current.renderSVG(this.state.current.ui.exportEditor.dim, res.width, res.height);
				const fname = 'GridGenerator.svg';
				downloadFile(svg, fname);
			}
		};
		this.onMouseDown = (e) => {
			return;
		};
		this.onMouseUp = (e) => {
			return;
		};
		this.onMouseMove = (e) => {
			return;
		};
		this.onTouchStart = (e) => {
			return;
		};
		this.onTouchMove = (e) => {
			return;
		};
		this.onTouchEnd = (e) => {
			return;
		};
		this.onTouchCancel = (e) => {
			return;
		};
	}
}
