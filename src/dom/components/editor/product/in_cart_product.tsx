import { linkEvent } from 'inferno';
import { CartProduct, ProductAt } from '../../../../data';
import { ProductEvents } from '../../../events/product_events';
import { AmmountBtn } from '../../base/buttons';

export interface IInCartProductProps {
	className?: string;
	product: CartProduct;
	events: ProductEvents;
	index: number;
}
function renderInfo(product: CartProduct) {
	const pcx = 'mh2';
	const tcx = 'ttu f6 ma0 pa0';
	const scx = 'ttu f7 ma0 pa0 normal';
	switch (product.at) {
		case ProductAt.Poster:
		return (
			<div className={pcx}>
				<h1 className={tcx}>{product.productType()}</h1>
				<h2 className={scx}>Size: <span>{product.posterType}</span></h2>
			</div>
		);
		case ProductAt.TShirt:
		return (
			<div className={pcx}>
				<h1 className={tcx}>{product.productType()}</h1>
				<h2 className={scx}>Size: <span>{product.tshirtSize}</span></h2>
				<h2 className={scx}>Type: <span>{product.tshirtType}</span></h2>
				<h2 className={scx + ' flex items-center justify-start'}>Color: <div className="mh2 ba w1 h1" style={{ background: product.tshirtColor}}/></h2>
			</div>
		);
	}
}
export const InCartProduct = (props: IInCartProductProps) => {
	if (!props.product.artViewbox || !props.product.artSVG) {
		return <div className="InCartProduct empty" />;
	}
	const extra = {
		'shape-rendering': 'crispEdges'
	};
	return (
		<article className="InCartProduct flex items-center justify-start">
			<div className="product bg-white ba w5 pa2 flex items-stretch justify-between">
				<div className="flex items-center justify-start">
					<svg
						version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
						className="w2 h2 mh2"
						viewBox={props.product.artViewbox.join(' ')}
						style={ { background: 'white' } }
						{...extra}
						dangerouslySetInnerHTML={ { __html: props.product.artSVG } }>
					</svg>
					{renderInfo(props.product)}
				</div>
				<div className="flex flex-column items-end justify-start">
					<p className="ma0 pa0 ttu orange f5 bold">€{props.product.price}</p>
					<p className="ma0 pa0 ttu black f8 normal small">(per unit)</p>
				</div>
			</div>
			<div className="tools ml2 flex flex-column items-between justify-center">
				<div className="quantity flex flex-column items-center justify-center mb3">
					<p className="f7 ttu normal ma0 pa0">Quantity</p>
					<AmmountBtn
						onInc={props.events.onCartIncQty}
						onDec={props.events.onCartDecQty}
						value={props.product.quantity}
						max={128}
						min={1}
						arg={props.index}
					/>
				</div>
				<a
					href="#"
					className="link dim red f8 ttu ma0 pa0"
					onClick={linkEvent(props.index, props.events.onCartRemove)}
				>Remove</a>
			</div>
		</article>
	);
};
