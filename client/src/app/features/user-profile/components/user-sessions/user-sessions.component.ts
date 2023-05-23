import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { MetaPagination, UserSession } from '../../../../common/models';
import { TableCellDirective, TableColumnDirective, TableComponent } from '../../../../core-ui/components';
import { CurrentDevicePipe } from './current-device.pipe';
import { NzButtonModule } from 'ng-zorro-antd/button';

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
        NzButtonModule
    ],
    templateUrl: './user-sessions.component.html',
})
export class UserSessionsComponent {
    @Input() sessions: UserSession[] | null = [];
    @Input() pagination: MetaPagination | null = null;
    @Output() pageChange = new EventEmitter();
}
