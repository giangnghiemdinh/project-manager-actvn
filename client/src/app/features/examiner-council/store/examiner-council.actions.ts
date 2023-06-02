import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ExaminerCouncil, PaginationPayload, PaginationResponse, Project } from '../../../common/models';

export const ExaminerCouncilActions = createActionGroup({
    source: 'Examiner Council',
    events: {
        'Load All Project': props<{
            payload: PaginationPayload,
            response?: PaginationResponse<Project>
        }>(),
        'Load All Project Success': props<{ response: PaginationResponse<Project> }>(),
        'Load All Project Failure': props<{ errors: any }>(),

        'Load Examiner Councils': emptyProps(),
        'Load Examiner Councils Success': props<{ response: PaginationResponse<ExaminerCouncil> }>(),
        'Load Examiner Councils Failure': props<{ errors: any }>(),

        'Load Examiner Council': props<{ payload: { id: number } }>(),
        'Load Examiner Council Success': props<{ response: ExaminerCouncil }>(),
        'Load Examiner Council Failure': props<{ errors: any }>(),

        'Create Examiner Council': props<{ payload: ExaminerCouncil }>(),
        'Create Examiner Council Success': props<{ response: ExaminerCouncil }>(),
        'Create Examiner Council Failure': props<{ errors: any }>(),

        'Create Multiple Examiner Council': props<{ payload: ExaminerCouncil[] }>(),
        'Create Multiple Examiner Council Success': emptyProps(),
        'Create Multiple Examiner Council Failure': props<{ errors: any }>(),

        'Update Examiner Council': props<{ payload: ExaminerCouncil }>(),
        'Update Examiner Council Success': emptyProps(),
        'Update Examiner Council Failure': props<{ errors: any }>(),

        'Delete Examiner Council': props<{ payload: { id: number } }>(),
        'Delete Examiner Council Success': emptyProps(),
        'Delete Examiner Council Failure': props<{ errors: any }>(),

        'Update Visible': props<{ isVisible: boolean }>()
    }
});
