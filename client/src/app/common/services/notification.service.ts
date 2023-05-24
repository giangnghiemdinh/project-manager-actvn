import { inject, Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private readonly notification = inject(NzNotificationService);

    success(message: string = '', options?: object) {
        this.notification.success('Thông báo!', message, options)
    }

    error(message: string = '', options?: object) {
        this.notification.error('Thông báo!', message, options)
    }

    info(message: string = '', options?: object) {
        this.notification.info('Thông báo!', message, options)
    }

    warning(message: string = '', options?: object) {
        this.notification.warning('Thông báo!', message, options)
    }
}
