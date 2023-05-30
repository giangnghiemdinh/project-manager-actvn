import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { MetaPagination, UserSession } from '../../../../common/models';
import {
    ConfirmComponent,
    TableCellDirective,
    TableColumnDirective,
    TableComponent
} from '../../../../core-ui/components';
import { CurrentDevicePipe } from './current-device.pipe';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { first } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@Component({
    selector: 'app-user-sessions',
    standalone: true,
    imports: [
        NgForOf,
        TableComponent,
        TableColumnDirective,
        TableCellDirective,
        DatePipe,
        NgIf,
        CurrentDevicePipe,
        NzButtonModule,
        NzToolTipModule
    ],
    templateUrl: './user-sessions.component.html',
})
export class UserSessionsComponent {
    readonly #modal = inject(NzModalService);
    @Input() sessions: UserSession[] | null = [];
    @Input() pagination: MetaPagination | null = null;
    @Output() pageChange = new EventEmitter();
    @Output() delete = new EventEmitter();

    onDelete(session: UserSession) {
        const ref = this.#modal.create({
            nzWidth: 400,
            nzContent: ConfirmComponent,
            nzClosable: false,
            nzCentered: true,
            nzAutofocus: null,
            nzData: {
                title: `Bạn có chắc chắn muốn đăng xuất khỏi thiết bị ${session.deviceName}?`,
                okText: 'Đăng xuất',
                okDanger: true
            },
            nzFooter: null
        });
        ref.afterClose
            .pipe(first())
            .subscribe(confirm => confirm && this.delete.emit(session));
    }
}
