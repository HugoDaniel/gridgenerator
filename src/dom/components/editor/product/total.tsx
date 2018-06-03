export interface IPriced {
	price: number;
	quantity: number;
}
export interface ITotalPriceProps {
	className?: string;
	products: IPriced[];
}
function sumPrices(p: IPriced[]): number {
	let total = 0;
	for (let i = 0; i < p.length; i++) {
		total += p[i].price * p[i].quantity;
	}
	return total;
}
export const TotalPrice = (props: ITotalPriceProps) => {
	const cx = `TotalPrice flex items-center justify-center`;
	const pcx = `ttu f7 ma0 pa0 mr2`;
	if (props.products.length > 0) {
		return (
			<div className={cx}>
				<p className={pcx}>
					Total:
				</p>
				<p className="ttu b f5 ma0 pa0">
					€{sumPrices(props.products)}
				</p>
			</div>
		);
	} else {
		return (
			<div className={cx}>
				<p className={pcx}>
					No items in the cart
				</p>
			</div>
		);
	}
};
