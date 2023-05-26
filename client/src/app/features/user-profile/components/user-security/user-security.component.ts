import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { User } from '../../../../common/models';
import { RolePipe } from '../../../../core-ui/pipes';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-user-security',
    standalone: true,
    imports: [
        NzButtonModule,
        RolePipe,
        NgIf
    ],
    templateUrl: './user-security.component.html',
})
export class UserSecurityComponent {
    @Input() isAdministrator: boolean | null = false;
    @Input() isSelf: boolean | null = false;
    @Input() user: User | null = null;
    @Output() openChange = new EventEmitter<'email' | 'password' | '2fa'>();
}
