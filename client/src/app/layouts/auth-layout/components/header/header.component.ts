import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LAYOUT_CONFIG } from '../../../../common/constants';
import { LetDirective } from '../../../../core-ui/directives';
import { interval, map, startWith } from 'rxjs';
import { AsyncPipe, DatePipe } from '@angular/common';
import { User } from '../../../../common/models';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { DriverUrlPipe, RolePipe } from '../../../../core-ui/pipes';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-header',
    standalone: true,
    templateUrl: './header.component.html',
    imports: [
        DatePipe,
        NzDropDownModule,
        DriverUrlPipe,
        NzAvatarModule,
        LetDirective,
        AsyncPipe,
        RouterLink,
        RolePipe
    ]
})
export class HeaderComponent {
    @Input() profile: User | null = null;
    @Input() isCollapsed = false;
    @Output() logout = new EventEmitter();
    CONFIG = LAYOUT_CONFIG;
    now$= interval(1000)
        .pipe(
            startWith(new Date()),
            map(_ => new Date()),
            takeUntilDestroyed()
        );
}
