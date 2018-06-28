import { ExportAt, ExportEditorFormat, FatState, PlayerState, ProjectMap, UIExportEditor } from '../../data';
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
	public onExitFeatures: (onDone?: () => void) => void;
	public prepareFile: () => void;
	public doneFile: (fname: string) => void;
	public downloadFile: () => void;
	public onError: (error: string) => void;
	// event handler:
	public onMouseDown: (e: MouseEvent) => void;
	public onMouseMove: (e: MouseEvent) => void;
	public onMouseUp: (e: MouseEvent) => void;
	public onTouchStart: (e: TouchEvent) => void;
	public onTouchMove: (e: TouchEvent) => void;
	public onTouchEnd: (e: TouchEvent) => void;
	public onTouchCancel: (e: TouchEvent) => void;
	constructor(rt: Runtime, s: FatState, n: Net, p: ProjectMap, refresher: Refresher, onExit: (onDone?: () => void) => void) {
		this.runtime = rt;
		this.state = s;
		this.refresher = refresher;
		this.net = n;
		this.projects = p;
		this.onExitFeatures = onExit;
		this.loadPaypal = () => {
			if (!this.runtime.token) {
				// TODO: GOTO LOGIN
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
									this.projects.exportCurrent().then((proj) => {
										if (this.runtime.token) {
											this.net.export.postExportPayment(this.runtime.token, payment, proj).then((_) => {
												// TODO: SET THANK YOU PAGE!
												this.state.exportImagePreview(true);
												this.refresher.refreshStateAndDOM(this.state);
											}, (fail) => {
												// tslint:disable-next-line:no-console
												console.log('ERROR CONTACTING SERVER AFTER PAYMENT', fail);
												// TODO: render error
											});
										} else {
											// TODO: render error
										}
									});
								});
							},
							onCancel: (data, actions) => {
								this.onExitFeatures();
							},
							onError: (err) => {
								// TODO: render error
								this.onExitFeatures();
							}
						}, '#paypal-button');
					}
				}, (error) => {
					// tslint:disable-next-line:no-console
					console.log('ERROR LOADING PAYPAL', error);
				});
			}
		};
		this.onExportInit = () => {
			loadScript('https://www.paypalobjects.com/api/checkout.js', 'gg-paypal-checkout');
			// initialize player
			/* const ps = new PlayerState(proj);
			console.log('INITIALIZING PLAYER');
			this.projects.prepareToPlay(this.state.current, this.state).then((proj) => {
				ps.canvasWidth = Math.min(this.runtime.device.width, 128);
				ps.canvasHeight = Math.min(128, this.runtime.device.height);
				this.refresher.refreshPlayerInitialState(ps, this.projects.current.initialState);
				*/
				// check if the current project can be exported (if it was paid etc)
			console.log('initializing export');
			this.projects.getHash().then((hash) => {
				console.log('export hash');
				if (!this.runtime.token) {
					// TODO: set error
					console.log('export ERROR no token');
				} else {
					console.log('export checking with server');
					this.net.export.postCanExport(this.runtime.token, hash).then((response) => {
						console.log('export can export');
						this.state.exportImagePreview(response.canExport);
						this.refresher.refreshStateAndDOM(this.state);
					});
				}
			});
			// set loading
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
			const exportEditor = this.state.current.ui.exportEditor;
			if (exportEditor.at === ExportAt.Done && this.runtime.token && exportEditor.fname) {
				this.net.export.getExportFile(
					this.runtime.token,
					exportEditor.fname
				);
				return;
			}
			const res = exportEditor.calcres();
			if (exportEditor.at === ExportAt.Image) {
				if (exportEditor.format === ExportEditorFormat.PNG) {
					this.prepareFile();
					// RENDER PNG
					this.projects.getHash().then((hash) => {
						if (this.runtime.token) {
							this.net.export.postExportPNG(
								this.runtime.token, hash, exportEditor.calcres(), exportEditor.patternSize
							).then((exported) => {
								this.doneFile(exported.file);
							}, (error) => {
								console.log('GOT ERROR', error);
							});
						} else {
							// TODO: show error / redirect to login
						}
					});
				} else if (exportEditor.dim) {
					// RENDER SVG
					const svg = this.state.current.renderSVG(exportEditor.dim, res.width, res.height);
					const fname = 'GridGenerator.svg';
					downloadFile(svg, fname);
				}
			} else {
				// RENDER ANIM
				this.prepareFile();
				if (exportEditor.format === ExportEditorFormat.MP4) {
					this.projects.getHash().then((hash) => {
						if (this.runtime.token) {
							this.net.export.postExportMP4(
								this.runtime.token, hash, exportEditor.calcres()
							).then((exported) => {
								this.doneFile(exported.file);
							}, (error) => {
								console.log('GOT ERROR', error);
							});
						} else {
							// TODO: show error / redirect to login
						}
					});
				} else {
					// RENDER GIF
					this.projects.getHash().then((hash) => {
						if (this.runtime.token) {
							this.net.export.postExportGIF(
								this.runtime.token, hash, exportEditor.calcres()
							).then((exported) => {
								this.doneFile(exported.file);
							}, (error) => {
								console.log('GOT ERROR', error);
							});
						} else {
							// TODO: show error / redirect to login
						}
					});
				}
			}
		};
		this.doneFile = (fname) => {
			console.log('DONE FILE', fname);
			this.state.exportDone(fname);
			this.refresher.refreshStateAndDOM(this.state);
		};
		this.onError = (error) => {
			this.state.exportError(error);
			this.refresher.refreshStateAndDOM(this.state);
		};
		this.prepareFile = () => {
			this.state.exportPrepare();
			this.refresher.refreshStateAndDOM(this.state);
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
