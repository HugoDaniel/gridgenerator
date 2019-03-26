import { MeanderProfile } from '../../data';
import { Token } from './token';

export class NetProfile {
	private readonly projProps: string;
	private readonly hostname: string;
	private readonly graphql: (queryStr: string, token?: Token) => Promise<any>;
	private readonly getData: (url: string, token?: Token) => Promise<any>;
	constructor(hostname: string, graphql: (queryStr: string, token?: Token) => Promise<any>, getData: (url: string, token?: Token) => Promise<any>) {
		this.graphql = graphql;
		this.getData = getData;
		this.hostname = hostname;
		this.projProps =
		`id,
		title,
		description,
		legal,
		initialState,
		finalState,
		fatState,
		isPublished,
		action,
		svg,
		svgViewBox,
		publishedAt,
		createdAt,
		updatedAt,
		parentId,
		parentPath`;
	}
	public async getProfile(t: Token) {
		return this.graphql(`{ curProfile { id, name, badges, about, createdAt } }`, t);
	}
	public async getProject(id: number, t?: Token) {
		return this.graphql(`{ workById (id: ${id}) { ${this.projProps} }}`, t);
	}
	public async getProfileProjects(t: Token) {
		return this.graphql(
			`{ curWorks
				{
					edges {
						node {
							${this.projProps}
						}
					}
				}
			}`,
			t);
	}
	public async updateProfile(t: Token, profile: MeanderProfile) {
		const name = profile.filledName;
		const about = profile.filledAbout;
		if (!name) {
			return Promise.reject('Profile form not properly filled');
		}
		return this.graphql(
			`mutation
			{ setProfile(input: { name: "${name}", about: "${about ? about : null}" })
				{ profile { id, name, badges, about, createdAt } }
			}`,
		t);
	}
	public async setBadges(t: Token, badges: string[]) {
		return this.graphql(
			`mutation
			{ setBadges(input: { badges: ${JSON.stringify(badges)} })
				{ profile { id, name, badges, about, createdAt } }
			}`,
		t);
	}
}
