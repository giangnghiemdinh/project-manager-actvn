import { CanActivateFn, Router } from '@angular/router';
import { isEmpty } from 'lodash';
import { inject } from '@angular/core';
import { NotificationService } from '../services';
import { RO_USER_MANAGER } from '../constants';

export const userProfileGuard: CanActivateFn = (route, state) => {
    const id = route.params['id'];
    const notification = inject(NotificationService);
    const router = inject(Router);
    if (!isEmpty(id) && isNaN(+id)) {
        notification.error('ID người dùng không hợp lệ!');
        router.navigate(['/' + RO_USER_MANAGER]).then();
        return false;
    }
    return true;
};
