export interface IAboutGridGeneratorProps {
	className: string;
	titleClassName: string;
	subtitleClassName: string;
}
export const AboutGridGenerator = (props: IAboutGridGeneratorProps) =>
	<section
		className={`AboutGridGenerator user-select ${props.className}`}
	>
		<h1 className={props.titleClassName}>Grid Generator</h1>
		<h2 className={props.subtitleClassName}>The idea</h2>
		<div className="flex flex-column items-center justify-center">
			<p className="f6 pa3 measure lh-copy tj">
				The idea was born in 2014 from the concept of mixing and remixing art. Initially it started with sounds but rapidily evolved to another kind of tool. A painting tool made for the internet. In 2016 I quit my job and started to work on what would become Grid Generator. Back then it was still a rough tool to remix sounds with colors and simple visual forms. After a few cycles of focusing and unfocusing on it I decided to apply to a startup grant from the Portuguese state in 2017. The grant is named <a target="_blank" className="link" href="https://www.iapmei.pt/PRODUTOS-E-SERVICOS/Empreendedorismo-Inovacao/Empreendedorismo/Apoios-e-Incentivos/Startup-Voucher.aspx">StartUp Voucher</a>, and it consists in a small monthly fee to help new ideas mature and become new companies. I applied to it with the idea of developing a tool to draw patterns with grids and shapes. That was when Grid Generateor started evolving into what it is today.
			</p>
			<p className="f6 pa3 measure lh-copy tj">For a more personal touch on the inspiration behind Grid Generator checkout <a target="_blank" href="http://www.hugodaniel.pt/posts/2017-10-25-Lisbon-as-an-inspiration-for-my-project.html" className="link">this post </a> I wrote about it before WebSummit 2017.</p>
		</div>
	</section>
	;
