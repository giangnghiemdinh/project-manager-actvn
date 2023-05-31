import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { MetaPagination, UserEvent } from '../../../../common/models';
import { CurrentDevicePipe } from '../user-sessions/current-device.pipe';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { TableCellDirective, TableColumnDirective, TableComponent } from '../../../../core-ui/components';
import { ParseMessagePipe } from './parse-message.pipe';
import { NzPipesModule } from 'ng-zorro-antd/pipes';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-user-events',
    standalone: true,
    imports: [ NgForOf, CurrentDevicePipe, DatePipe, NgIf, NzButtonModule, NzWaveModule, TableCellDirective, TableColumnDirective, TableComponent, ParseMessagePipe, NzPipesModule, RouterLink ],
    templateUrl: './user-events.component.html',
})
export class UserEventsComponent {
    @Input() events: UserEvent[] | null = [];
    @Input() pagination: MetaPagination | null = null;
    @Output() pageChange = new EventEmitter();
}
