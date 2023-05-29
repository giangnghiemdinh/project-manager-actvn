import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { NotificationService } from '../services';
import { isEmpty } from 'lodash';
import { RO_PROJECT_MANAGER } from '../constants';

export const projectOverviewGuard: CanActivateFn = (route) => {
    const id = route.params['id'];
    const notification = inject(NotificationService);
    const router = inject(Router);
    if (isEmpty(id) || isNaN(+id)) {
        notification.error('ID đề tài không hợp lệ!');
        router.navigate(['/' + RO_PROJECT_MANAGER]).then();
        return false;
    }
    return true;
};
