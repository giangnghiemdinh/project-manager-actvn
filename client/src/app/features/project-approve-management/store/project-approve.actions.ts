import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { PaginationResponse, Project } from '../../../common/models';
import { ProjectStatus } from '../../../common/constants';

export const ProjectApproveActions = createActionGroup({
    source: 'Project Approve',
    events: {
        'Update Visible': props<{ isVisible: boolean }>(),

        'Load Projects': emptyProps(),
        'Load Projects Success': props<{ response: PaginationResponse<Project> }>(),
        'Load Projects Failure': props<{ errors: any }>(),

        'Load Project': props<{ payload: { id: number } }>(),
        'Load Project Success': props<{ response: Project }>(),
        'Load Project Failure': props<{ errors: any }>(),

        'Approve Project': props<{ payload: { id: number, status: ProjectStatus, reason: string } }>(),
        'Approve Project Success': props<{ response: Project }>(),
        'Approve Project Failure': props<{ errors: any }>()
    }
});
