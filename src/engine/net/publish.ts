import { Project } from '../../data';
import { Token } from './token';

export class NetPublish {
	private readonly postData: (url: string, data: object, token?: Token) => Promise<any>;
	private readonly graphql: (queryStr: string, token?: Token) => Promise<any>;
	private readonly hostname: string;
	constructor(hostname: string, graphql: (queryStr: string) => Promise<any>, post: (url: string, data: object) => Promise<any>) {
		this.graphql = graphql;
		this.postData = post;
		this.hostname = hostname;
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
			const input = `{
				title: ${JSON.stringify(title)},
				description: ${desc ? desc : null},
				license: ${license},
				svg: ${JSON.stringify(svg)},
				svgviewbox: [${viewbox[2]}, ${viewbox[3]}],
				initialState: ${JSON.stringify(JSON.stringify(project.initialState))},
				finalState: ${JSON.stringify(JSON.stringify(project.finalState))},
				fatState: ${JSON.stringify(JSON.stringify(project.fatState))},
				version: ${project.initialState.version},
				action: ${project.action},
				parent: ${project.parentId ? project.parentId : null}
			}`;
			const query =
			`mutation {
				newWork(input: ${input}) {
					work { id, publishedAt }
				}
			}
			`;
			console.log('PUBLISHING WITH SIZE', query.length, 'bytes');
			const work = {
				title,
				description: desc ? desc : null,
				license,
				svg,
				svgviewbox: [viewbox[2], viewbox[3]],
				initialState: project.initialState,
				finalState: project.finalState,
				fatState: project.fatState,
				version: project.initialState.version,
				action: project.action,
				parent: project.parentId ? project.parentId : null
			};
			this.postData(this.hostname + '/publish/', { work, query }, t)
			.then((response) => {
				if (response.ok) {
					resolve(response.json());
				} else if (response.status === 401) {
					// unauthorized, reject with 'Unauthorized';
					reject('Unauthorized');
				} else {
					response.json().then(reject);
				}
		}, reject);
		});
		return result;
	}
}
