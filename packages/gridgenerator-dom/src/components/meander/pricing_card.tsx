export interface IPricingCardProps {
  imgUrl: string;
  name: string;
  className: string;
  title1: string;
  subtitle1: string;
  title2?: string;
  subtitle2?: string;
  desc: string;
  children?: any;
}
export const PricingCard = (props: IPricingCardProps) => (
  <article
    class={`PricingCard mw5 center bg-white br3 pa3 pa4-ns mv3 ba b--black-10 ${
      props.className
    }`}
  >
    <div class="tc">
      <h1 class="f4 mb4 mt1">{props.name}</h1>
      <img
        src={props.imgUrl}
        class="h3 w3 dib"
        alt={`Icon for our "${props.name}" plan`}
      />
      <h2 class="h4 f4">
        {props.title1}
        <br />
        <span className="f6 gray">{props.subtitle1}</span>
      </h2>
      {props.title2 ? (
        <h3 className="f5">
          {props.title2}
          <br />
          <span className="f6 gray">{props.subtitle2}</span>
        </h3>
      ) : (
        <div />
      )}
      <hr class="mw3 bb bw1 b--black-10" />
    </div>
    <p class="h4 flex items-center lh-copy measure center f6 black-70">
      {props.desc}
    </p>
    <hr class="mw3 bb bw1 b--black-10" />
    {props.children}
  </article>
);
