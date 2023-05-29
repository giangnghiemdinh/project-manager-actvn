import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { canActivateVerify } from './features/security/tfa-verify/tfa-verify.guard';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import {
    authGuard,
    projectOverviewGuard,
    publicGuard,
    resetPasswordGuard,
    roleGuard,
    userProfileGuard
} from './common/guards';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { StudentEffects } from './features/student-management/store/student.effects';
import { studentFeature } from './features/student-management/store/student.reducer';
import { projectFeature } from './features/project-management/store/project.reducer';
import { ProjectEffects } from './features/project-management/store/project.effects';
import {
    RO_DEPARTMENT_MANAGER,
    RO_ERROR_403,
    RO_EXAMINER_COUNCIL,
    RO_FORGOT_PASS,
    RO_GENERAL_STATISTIC,
    RO_LOGIN,
    RO_MANAGER_STAFF,
    RO_PROFILE,
    RO_PROJECT_APPROVE,
    RO_PROJECT_MANAGER,
    RO_PUBLIC,
    RO_RESET_PASS,
    RO_REVIEWER_STAFF,
    RO_SEMESTER_MANAGER,
    RO_STUDENT_MANAGER,
    RO_TWO_FACTOR,
    RO_USER_MANAGER,
    Role
} from './common/constants';
import { userFeature } from './features/user-management/store/user.reducer';
import { UserEffects } from './features/user-management/store/user.effects';
import { departmentFeature } from './features/department-management/store/department.reducer';
import { DepartmentEffects } from './features/department-management/store/department.effects';
import { projectApproveFeature } from './features/project-approve-management/store/project-approve.reducer';
import { ProjectApproveEffects } from './features/project-approve-management/store/project-approve.effects';
import { examinerCouncilFeature } from './features/examiner-council/store/examiner-council.reducer';
import { ExaminerCouncilEffects } from './features/examiner-council/store/examiner-council.effects';
import { userProfileFeature } from './features/user-profile/store/user-profile.reducer';
import { UserProfileEffects } from './features/user-profile/store/user-profile.effects';
import { semesterFeature } from './features/semester-management/store/semester.reducer';
import { SemesterEffects } from './features/semester-management/store/semester.effects';
import { managerStaffFeature } from './features/manager-staff/stores/manager-staff.reducer';
import { ManagerStaffEffects } from './features/manager-staff/stores/manager-staff.effects';
import { reviewerStaffFeature } from './features/reviewer-staff/stores/reviewer-staff.reducer';
import { ReviewerStaffEffects } from './features/reviewer-staff/stores/reviewer-staff.effects';
import { generalStatisticFeature } from './features/general-statistic/store/general-statistic.reducer';
import { GeneralStatisticEffects } from './features/general-statistic/store/general-statistic.effects';

export const appRoutes: Routes = [
    {
        path: RO_ERROR_403,
        loadComponent: () => import('./features/not-authorized/page-not-permission/page-not-permission.component').then(c => c.PageNotPermissionComponent)
    },
    {
        path: RO_PUBLIC,
        component: PublicLayoutComponent,
        canActivate: [ publicGuard ],
        children: [
            {
                path: RO_LOGIN,
                loadComponent: () => import('./features/security/login/login.component').then(c => c.LoginComponent)
            },
            {
                path: RO_FORGOT_PASS,
                loadComponent: () => import('./features/security/forgot-password/forgot-password.component').then(c => c.ForgotPasswordComponent)
            },
            {
                path: RO_RESET_PASS,
                canActivate: [ resetPasswordGuard ],
                loadComponent: () => import('./features/security/reset-password/reset-password.component').then(c => c.ResetPasswordComponent)
            },
            {
                path: RO_TWO_FACTOR,
                canActivate: [ canActivateVerify ],
                loadComponent: () => import('./features/security/tfa-verify/tfa-verify.component').then(c => c.TfaVerifyComponent)
            },
            {
                path: '**',
                redirectTo: 'login'
            }
        ]
    },
    {
        path: '',
        component: AuthLayoutComponent,
        canActivate: [ authGuard ],
        canActivateChild: [ roleGuard ],
        children: [
            {
                path: '',
                redirectTo: RO_PROJECT_MANAGER,
                pathMatch: 'full'
            },
            {
                path: RO_USER_MANAGER,
                data: { role: Role.ADMINISTRATOR },
                children: [
                    {
                        path: '',
                        providers: [
                            provideState(userFeature),
                            provideEffects(UserEffects)
                        ],
                        loadComponent: () => import('./features/user-management/user-management.component').then(c => c.UserManagementComponent)
                    },
                    {
                        path: ':id',
                        canActivate: [ userProfileGuard ],
                        providers: [
                            provideState(userProfileFeature),
                            provideEffects(UserProfileEffects)
                        ],
                        loadComponent: () => import('./features/user-profile/user-profile.component').then(c => c.UserProfileComponent)
                    }
                ]
            },
            {
                path: RO_DEPARTMENT_MANAGER,
                data: { role: Role.ADMINISTRATOR },
                providers: [
                    provideState(departmentFeature),
                    provideEffects(DepartmentEffects)
                ],
                loadComponent: () => import('./features/department-management/department-management.component').then(c => c.DepartmentManagementComponent)
            },
            {
                path: RO_SEMESTER_MANAGER,
                data: { role: Role.ADMINISTRATOR },
                providers: [
                    provideState(semesterFeature),
                    provideEffects(SemesterEffects)
                ],
                loadComponent: () => import('./features/semester-management/semester-management.component').then(c => c.SemesterManagementComponent)
            },
            {
                path: RO_PROJECT_MANAGER,
                providers: [
                    provideState(projectFeature),
                    provideEffects(ProjectEffects)
                ],
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./features/project-management/project-management.component').then(c => c.ProjectManagementComponent)
                    },
                    {
                        path: ':id',
                        canActivate: [ projectOverviewGuard ],
                        loadComponent: () => import('./features/project-management/components/project-overview/project-overview.component').then(c => c.ProjectOverviewComponent)
                    }
                ]
            },
            {
                path: RO_PROJECT_APPROVE,
                data: { role: [Role.ADMINISTRATOR, Role.CENSOR] },
                providers: [
                    provideState(projectApproveFeature),
                    provideEffects(ProjectApproveEffects)
                ],
                loadComponent: () => import('./features/project-approve-management/project-approve-management.component').then(c => c.ProjectApproveManagementComponent)
            },
            {
                path: RO_STUDENT_MANAGER,
                data: { role: Role.ADMINISTRATOR },
                providers: [
                    provideState(studentFeature),
                    provideEffects(StudentEffects)
                ],
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./features/student-management/student-management.component').then(c => c.StudentManagementComponent)
                    }
                ]
            },
            {
                path: RO_MANAGER_STAFF,
                providers: [
                    provideState(managerStaffFeature),
                    provideEffects(ManagerStaffEffects)
                ],
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./features/manager-staff/manager-staff.component').then(c => c.ManagerStaffComponent)
                    },
                    {
                        path: 'mass',
                        loadComponent: () => import('./features/manager-staff/components/manager-staff-mass/manager-staff-mass.component').then(c => c.ManagerStaffMassComponent)
                    }
                ]
            },
            {
                path: RO_REVIEWER_STAFF,
                providers: [
                    provideState(reviewerStaffFeature),
                    provideEffects(ReviewerStaffEffects)
                ],
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./features/reviewer-staff/reviewer-staff.component').then(c => c.ReviewerStaffComponent)
                    },
                    {
                        path: 'mass',
                        loadComponent: () => import('./features/reviewer-staff/components/reviewer-staff-mass/reviewer-staff-mass.component').then(c => c.ReviewerStaffMassComponent)
                    }
                ]
            },
            {
                path: RO_EXAMINER_COUNCIL,
                providers: [
                    provideState(examinerCouncilFeature),
                    provideEffects(ExaminerCouncilEffects)
                ],
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./features/examiner-council/examiner-council.component').then(c => c.ExaminerCouncilComponent)
                    },
                    {
                        path: 'mass',
                        loadComponent: () => import('./features/examiner-council/components/examiner-council-setup/examiner-council-setup.component').then(c => c.ExaminerCouncilSetupComponent)
                    }
                ]
            },
            {
                path: RO_PROFILE,
                providers: [
                    provideState(userProfileFeature),
                    provideEffects(UserProfileEffects)
                ],
                loadComponent: () => import('./features/user-profile/user-profile.component').then(c => c.UserProfileComponent)
            },
            {
                path: RO_GENERAL_STATISTIC,
                data: { role: Role.ADMINISTRATOR },
                providers: [
                    provideState(generalStatisticFeature),
                    provideEffects(GeneralStatisticEffects)
                ],
                loadComponent: () => import('./features/general-statistic/general-statistic.component').then(c => c.GeneralStatisticComponent)
            },
        ]
    },
    {
        path: '**',
        loadComponent: () => import('./features/not-authorized/page-not-found/page-not-found.component').then(c => c.PageNotFoundComponent)
    }
];
