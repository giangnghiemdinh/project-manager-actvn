import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { PaginationResponse, Project, ProjectImportPayload, ProjectProgress, User } from '../../../common/models';
import { ProjectProgressType } from '../../../common/constants';

export type ModalType = '' | 'form' | 'import' | 'report' | 'review' | 'council';

export const ProjectActions = createActionGroup({
    source: 'Project',
    events: {
        'Update Visible': props<{ isVisible: boolean, modal: ModalType }>(),

        'Load Projects': emptyProps(),
        'Load Projects Success': props<{ response: PaginationResponse<Project>, profile: User | null }>(),
        'Load Projects Failure': props<{ errors: any }>(),

        'Load Project': props<{ payload: { id: number, modal: ModalType, extra?: string } }>(),
        'Load Project Success': props<{ response: Project, modal: ModalType }>(),
        'Load Project Failure': props<{ errors: any }>(),

        'Create Project': props<{ payload: Project }>(),
        'Create Project Success': props<{ response: Project }>(),
        'Create Project Failure': props<{ errors: any }>(),

        'Create Propose Project': props<{ payload: Project }>(),
        'Create Propose Project Success': props<{ response: Project }>(),
        'Create Propose Project Failure': props<{ errors: any }>(),

        'Update Project': props<{ payload: Project }>(),
        'Update Project Success': emptyProps(),
        'Update Project Failure': props<{ errors: any }>(),

        'Delete Project': props<{ payload: { id: number } }>(),
        'Delete Project Success': emptyProps(),
        'Delete Project Failure': props<{ errors: any }>(),

        'Report': props<{ payload: ProjectProgress }>(),
        'Report Success': props<{ response: ProjectProgress }>(),
        'Report Failure': props<{ errors: any }>(),

        'Review': props<{ payload: ProjectProgress }>(),
        'Review Success': props<{ response: ProjectProgress }>(),
        'Review Failure': props<{ errors: any }>(),

        'Council Review': props<{ payload: Project }>(),
        'Council Review Success': emptyProps(),
        'Council Review Failure': props<{ errors: any }>(),

        'Delete File': props<{ payload : { fileId: string, progress: ProjectProgress, removeFile: Function } }>(),
        'Delete File Success': emptyProps(),
        'Delete File Failure': props<{ errors: any }>(),

        'Import Project': props<{ payload: ProjectImportPayload }>(),
        'Import Project Success': emptyProps(),
        'Import Project Failure': props<{ errors: any }>(),

        'Load Report': props<{ payload: { id: number, type: ProjectProgressType } }>(),
        'Load Report Success': props<{ response: ProjectProgress }>(),
        'Load Report Failure': props<{ errors: any }>(),
    }
});
