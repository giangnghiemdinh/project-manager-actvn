import { Component, Input } from '@angular/core';
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
    @Input() id: string = '';
    @Input() user: User | null = null;
}
