import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { LAYOUT_CONFIG } from '../../../../common/constants';
import { LetDirective } from '../../../../core-ui/directives';
import { filter, interval, map, startWith } from 'rxjs';
import { AsyncPipe, DatePipe, NgClass, NgIf } from '@angular/common';
import { User } from '../../../../common/models';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { DriverUrlPipe, RolePipe } from '../../../../core-ui/pipes';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationCancel, NavigationEnd, NavigationStart, Router, RouterLink } from '@angular/router';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { MenuComponent } from '../menu/menu.component';
import { Theme } from '../../../../common/stores';

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
        RolePipe,
        NgIf,
        NzDrawerModule,
        MenuComponent,
        NgClass
    ]
})
export class HeaderComponent {
    readonly #router = inject(Router);
    @Input() theme: Theme | null = 'light';
    @Input() activeTheme: 'light' | 'dark' | null = 'light';
    @Input() profile: User | null = null;
    @Input() isFixedSidebar = false;
    @Input() isDesktop = true;
    @Output() logout = new EventEmitter();
    @Output() changeTheme = new EventEmitter();
    CONFIG = LAYOUT_CONFIG;
    isOpenDrawer = false;
    now$ = interval(1000)
        .pipe(
            startWith(new Date()),
            map(_ => new Date()),
            takeUntilDestroyed()
        );
    isNavigating$ = this.#router.events.pipe(
        filter(event => event instanceof NavigationStart
            || event instanceof NavigationCancel
            || event instanceof NavigationEnd),
        map(event => event instanceof NavigationStart)
    );
}
