import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ManagerStaff, PaginationPayload, PaginationResponse, Project } from '../../../common/models';

export const ManagerStaffActions = createActionGroup({
    source: 'Manager Staff',
    events: {
        'Load All Projects': props<{
            payload: PaginationPayload,
            response?: PaginationResponse<Project>
        }>(),
        'Load All Projects Success': props<{ response: PaginationResponse<Project> }>(),
        'Load All Projects Failure': props<{ errors: any }>(),
        
        'Load Manager Staffs': emptyProps(),
        'Load Manager Staffs Success': props<{ response: PaginationResponse<ManagerStaff> }>(),
        'Load Manager Staffs Failure': props<{ errors: any }>(),
        
        'Load Manager Staff': props<{ payload: { id: number } }>(),
        'Load Manager Staff Success': props<{ response: ManagerStaff }>(),
        'Load Manager Staff Failure': props<{ errors: any }>(),
        
        'Create Manager Staff': props<{ payload: ManagerStaff }>(),
        'Create Manager Staff Success': props<{ response: ManagerStaff }>(),
        'Create Manager Staff Failure': props<{ errors: any }>(),
        
        'Create Multiple Manager Staff': props<{ payload: ManagerStaff[] }>(),
        'Create Multiple Manager Staff Success': emptyProps(),
        'Create Multiple Manager Staff Failure': props<{ errors: any }>(),
        
        'Update Manager Staff': props<{ payload: ManagerStaff }>(),
        'Update Manager Staff Success': emptyProps(),
        'Update Manager Staff Failure': props<{ errors: any }>(),
        
        'Delete Manager Staff': props<{ payload: { id: number } }>(),
        'Delete Manager Staff Success': emptyProps(),
        'Delete Manager Staff Failure': props<{ errors: any }>(),
        
        'Update Visible': props<{ isVisible: boolean }>()
    }
});

