import { inject, Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly notification = inject(NzNotificationService);

  success(message: string = '', options?: object) {
    this.notification.success('Thành công!', message, options)
  }

  error(message: string = '', options?: object) {
    this.notification.error('Thất bại!', message, options)
  }

  info(message: string = '', options?: object) {
    this.notification.info('Thông tin!', message, options)
  }

  warning(message: string = '', options?: object) {
    this.notification.warning('Cảnh báo!', message, options)
  }
}
