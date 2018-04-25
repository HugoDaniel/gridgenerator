import { Project } from '../../data';
import { Token } from './token';

export class NetPublish {
	private readonly graphql: (queryStr: string, token?: Token) => Promise<any>;
	constructor(graphql: (queryStr: string) => Promise<any>) {
		this.graphql = graphql;
	}
	public publishProject(t: Token, project: Project) {
		const title = project.title;
		const desc = project.description;
		const license = project.legal;
		const svg = project.svg;
		const viewbox = project.svgViewBox;
		if (!viewbox || !svg) {
			return Promise.reject('Not enough SVG data in project');
		}
		const result: Promise<any> = new Promise((resolve, reject) => {
			const query =
			`mutation {
				newWork(input: {
					title: ${JSON.stringify(title)},
					description: ${desc ? desc : null}
					license: ${license},
					svg: ${JSON.stringify(svg)},
					svgviewbox: [${viewbox[2]}, ${viewbox[3]}],
					initialState: ${JSON.stringify(JSON.stringify(project.initialState))},
					finalState: ${JSON.stringify(JSON.stringify(project.finalState))},
					fatState: ${JSON.stringify(JSON.stringify(project.fatState))},
					version: ${project.initialState.version},
					action: ${project.action},
					parent: ${project.parentId ? project.parentId : null}
				}) {
					work { id, publishedAt }
				}
			}
			`;
			this.graphql(query, t).then(resolve, reject);
		});
		return result;
	}
}
