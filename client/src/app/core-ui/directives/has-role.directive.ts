import { Directive, inject, Input, SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { AuthState, selectProfile } from '../../common/stores';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Role } from '../../common/constants/user.constant';

type RoleType = 'Administrator' | 'Censor' | 'Lecturer';

@Directive({
    selector: '[hasRole]',
    standalone: true
})
export class HasRoleDirective {

    private readonly authStore = inject(Store<AuthState>);
    @Input() hasRole: RoleType | RoleType[] = [];
    role: Role = Role.ADMINISTRATOR;

    constructor(
        private readonly viewContainer: ViewContainerRef,
        private readonly templateRef: TemplateRef<any>
    ) {
        this.selectProfile();
    }

    ngOnChanges(changes: SimpleChanges): void {
        const { hasRole } = changes;
        if (hasRole) { this.validateRole(); }
    }

    private validateRole() {
        const roles: any[] = this.hasRole ? (Array.isArray(this.hasRole) ? this.hasRole : [ this.hasRole ]) : [];
        if (!roles.length || roles.includes(this.role)) {
            this.showTemplateBlockInView();
        } else {
            this.viewContainer.clear();
        }
    }

    private selectProfile() {
        this.authStore.select(selectProfile)
            .pipe(takeUntilDestroyed())
            .subscribe(profile => {
                this.role = profile?.role || Role.LECTURER;
                this.validateRole();
            });
    }

    private showTemplateBlockInView(): void {
        this.viewContainer.clear();
        if (!this.templateRef) {
            return;
        }
        this.viewContainer.createEmbeddedView(this.templateRef);
    }

}
