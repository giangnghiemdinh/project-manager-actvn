import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { NotificationService } from '../services';
import { throwError } from 'rxjs';
import { DEFAULT_ERROR_MESSAGE } from '../constants/common.constant';
import { values } from 'lodash';

export const IGNORE_ERROR_ALERT = new HttpContextToken<boolean>(() => false);

export const apiErrorsInterceptor: HttpInterceptorFn = (req, next) => {
    const notification = inject(NotificationService);
    return next(req).pipe(catchError(error => {
        if (!req.context.get(IGNORE_ERROR_ALERT)) {
            let message = '';
            switch (error.status) {
                case 0:
                case 401:
                case 902:
                    break;
                case 403:
                    message = 'Bạn không có quyền truy cập chức năng này.';
                    break;
                case 429:
                    message = 'Thao tác quá nhanh! Vui lòng chậm lại.';
                    break;
                default:
                    const errorMessage = error.error?.message;
                    if (errorMessage && typeof errorMessage === 'string') {
                        message = errorMessage;
                    } else if (errorMessage && Array.isArray(errorMessage) && errorMessage.length) {
                        const [ first ] = errorMessage;
                        message = values(first.constraints || {}).join('\n');
                    } else {
                        message = DEFAULT_ERROR_MESSAGE;
                    }
            }
            message && notification.error(message);
        }
        return throwError(error);
    }));
}
