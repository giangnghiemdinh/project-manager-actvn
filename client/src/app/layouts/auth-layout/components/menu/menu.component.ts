import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { collapseMotion, fadeL2rMotion } from '../../../../common/animations';
import {
    RO_DEPARTMENT_MANAGER,
    RO_EXAMINER_COUNCIL,
    RO_MANAGER_STAFF,
    RO_PROJECT_APPROVE,
    RO_PROJECT_MANAGER,
    RO_REVIEWER_STAFF,
    RO_SEMESTER_MANAGER,
    RO_STUDENT_MANAGER,
    RO_USER_MANAGER,
    Role
} from '../../../../common/constants';
import { Menu } from './menu.model';
import { MenuLinkActiveDirective } from '../../../../core-ui/directives';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [ RouterLink, NgClass, NgIf, NgForOf, MenuLinkActiveDirective ],
    templateUrl: './menu.component.html',
    animations: [ collapseMotion, fadeL2rMotion ],
})
export class MenuComponent {

    @Input()
    set role(role: Role | undefined) {
        if (!role) {
            return;
        }
        this.buildMenus(role);
    }

    @Input() isCollapsedSidebar = false;
    @Output() itemClick = new EventEmitter();
    activeMenuId = -1;
    menus: Menu[] = [];

    onToggleMenu(id: number) {
        this.activeMenuId = ( this.activeMenuId === id && -1 ) || id;
    }

    private buildMenus(role: Role) {
        let menus: Menu[] = [];

        const managementMenus: Menu[] = [];
        if (role === Role.ADMINISTRATOR) {
            managementMenus.push({
                title: 'Danh sách người dùng',
                routerLink: RO_USER_MANAGER,
                icon: 'bx-user',
                active: false
            });
        }
        if (role === Role.ADMINISTRATOR) {
            managementMenus.push({
                title: 'Danh sách khoa',
                routerLink: RO_DEPARTMENT_MANAGER,
                icon: 'bx bxs-business',
                active: false
            });
        }
        if (role === Role.ADMINISTRATOR) {
            managementMenus.push({
                title: 'Danh sách học kỳ',
                routerLink: RO_SEMESTER_MANAGER,
                icon: 'bx-food-menu',
                active: false
            });
        }
        if (role === Role.ADMINISTRATOR) {
            managementMenus.push({
                title: 'Danh sách sinh viên',
                routerLink: RO_STUDENT_MANAGER,
                icon: 'bxs-user-detail',
                active: false
            });
        }
        managementMenus.push({
            title: 'Danh sách đề tài',
            routerLink: RO_PROJECT_MANAGER,
            icon: 'bx-book-alt',
            active: false
        });
        if ([ Role.CENSOR, Role.ADMINISTRATOR ].includes(role)) {
            managementMenus.push({
                title: 'Danh sách đề xuất đề tài',
                routerLink: RO_PROJECT_APPROVE,
                icon: 'bx-book-add',
                active: false
            });
        }
        // if (role === Role.ADMINISTRATOR) {
        //     managementMenus.push({
        //         title: 'Danh sách tiến độ',
        //         routerLink: RO_PROGRESS_MANAGER,
        //         icon: 'bx-calendar-alt',
        //         active: false
        //     });
        // }
        managementMenus.push({
            title: 'Danh sách GV quản lý',
            routerLink: RO_MANAGER_STAFF,
            icon: 'bxs-group',
            active: false
        });
        managementMenus.push({
            title: 'Danh sách GV phản biện',
            routerLink: RO_REVIEWER_STAFF,
            icon: 'bx-check-circle',
            active: false
        });
        managementMenus.push({
            title: 'Danh sách HĐ bảo vệ',
            routerLink: RO_EXAMINER_COUNCIL,
            icon: 'bx-rocket',
            active: false
        });
        managementMenus.length && ( menus = [ ...menus, { separator: 'Quản lý' }, ...managementMenus ] );

        // const statisticalMenus: Menu[] = [];
        // if (role === Role.ADMINISTRATOR) {
        //     statisticalMenus.push({
        //         title: 'Tổng quan',
        //         routerLink: RO_GENERAL_STATISTIC,
        //         icon: 'bx-line-chart',
        //         active: false
        //     });
        // }
        // statisticalMenus.length && (menus = [...menus, { separator: 'Thống kê' }, ...statisticalMenus]);

        this.menus = [ ...menus ];
    }
}
