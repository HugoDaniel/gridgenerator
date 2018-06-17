// @ts-ignore
import { icon } from '../../../assets/icons/projects-new.svg';
import { Project, StoredProject } from '../../../data';
import { Button } from '../base/buttons';
import { ProjectCard } from './project_card';

export interface IProfileProjectsProps {
	className: string;
	titleClassName: string;
	subtitleClassName: string;
	currentProject: Project;
	projects: StoredProject[];
	isLoading: boolean;
	onProjectView: (id: number, e: Event) => void;
	onProjectNew: () => void;
}
// <h2 className={props.subtitleClassName}>Newest first</h2>
export const ProfileProjects = (props: IProfileProjectsProps) => {
	return (
	<section
		className={`ProfileProjects user-select ${props.className}`}
	>
		<h1 className={props.titleClassName}>Projects</h1>
		{ props.isLoading
		? <h2 className={props.subtitleClassName}>Loading...</h2>
		:
		<div className="w-100">
			<div className="h-100 flex flex-wrap flex-row items-start justify-center">
				{[
				<div
					className="flex items-center justify-center mw5 pa3 ma3"
					style={{ height: 190, width: 254 }}
				>
					<Button
						className=""
						label="New Project"
						onAction={props.onProjectNew}
					/>
				</div>,
				...props.projects.map((p) =>
					<ProjectCard project={p} onView={props.onProjectView} />
				)
				]}
			</div>
		</div>
		}
	</section>
	);
};
