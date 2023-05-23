import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { PaginationPayload, PaginationResponse, Project, ReviewerStaff } from '../../../common/models';

export const ReviewerStaffActions = createActionGroup({
    source: 'Reviewer Staff',
    events: {
        'Load All Projects': props<{
            payload: PaginationPayload,
            response?: PaginationResponse<Project>
        }>(),
        'Load All Projects Success': props<{ response: PaginationResponse<Project> }>(),
        'Load All Projects Failure': props<{ errors: any }>(),
        
        'Load Reviewer Staffs': emptyProps(),
        'Load Reviewer Staffs Success': props<{ response: PaginationResponse<ReviewerStaff> }>(),
        'Load Reviewer Staffs Failure': props<{ errors: any }>(),
        
        'Load Reviewer Staff': props<{ payload: { id: number } }>(),
        'Load Reviewer Staff Success': props<{ response: ReviewerStaff }>(),
        'Load Reviewer Staff Failure': props<{ errors: any }>(),
        
        'Create Reviewer Staff': props<{ payload: ReviewerStaff }>(),
        'Create Reviewer Staff Success': props<{ response: ReviewerStaff }>(),
        'Create Reviewer Staff Failure': props<{ errors: any }>(),
        
        'Create Multiple Reviewer Staff': props<{ payload: ReviewerStaff[] }>(),
        'Create Multiple Reviewer Staff Success': emptyProps(),
        'Create Multiple Reviewer Staff Failure': props<{ errors: any }>(),
        
        'Update Reviewer Staff': props<{ payload: ReviewerStaff }>(),
        'Update Reviewer Staff Success': emptyProps(),
        'Update Reviewer Staff Failure': props<{ errors: any }>(),
        
        'Delete Reviewer Staff': props<{ payload: { id: number } }>(),
        'Delete Reviewer Staff Success': emptyProps(),
        'Delete Reviewer Staff Failure': props<{ errors: any }>(),
        
        'Update Visible': props<{ isVisible: boolean }>()
    }
})

