import { Component, inject, OnDestroy } from '@angular/core';
import { ProjectStatusPipe } from '../../../../core-ui/pipes/project-status.pipe';
import { ToolbarComponent } from '../../../../core-ui/components';
import { AsyncPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { ProjectState, selectIsLoading, selectProject } from '../../store/project.reducer';
import { Store } from '@ngrx/store';
import { NavigationEnd, Router, RouterLink, Scroll } from '@angular/router';
import { filter, ReplaySubject, takeUntil } from 'rxjs';
import { concatLatestFrom } from '@ngrx/effects';
import { selectRouterParam } from '../../../../common/stores/router';
import { RouterReducerState } from '@ngrx/router-store';
import { ProjectActions } from '../../store/project.actions';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { ProgressDetailPipe } from './progress-detail.pipe';
import { LetDirective } from '../../../../core-ui/directives';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
    selector: 'app-project-overview',
    standalone: true,
    imports: [ ProjectStatusPipe, ToolbarComponent, NgClass, NgIf, NzSpinModule, AsyncPipe, NgForOf, ProgressDetailPipe, LetDirective, NzToolTipModule, NzButtonModule, RouterLink ],
    templateUrl: './project-overview.component.html',
})
export class ProjectOverviewComponent implements OnDestroy {

    private readonly destroy$ = new ReplaySubject<void>(1);
    private readonly routerStore = inject(Store<RouterReducerState>);
    private readonly store = inject(Store<ProjectState>);
    private readonly router = inject(Router);

    project$ = this.store.select(selectProject);
    isLoading$ = this.store.select(selectIsLoading);

    constructor() {
        this.onLoad();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onLoad() {
        this.router.events
            .pipe(
                filter(event => event instanceof Scroll && event.routerEvent instanceof NavigationEnd),
                concatLatestFrom(_ => this.routerStore.select(selectRouterParam('id'))),
                takeUntil(this.destroy$)
            )
            .subscribe(([_, id]) => {
                this.store.dispatch(ProjectActions.loadProject({ payload: { id: +id, modal: '', extra: 'pg' } }));
            });
    }

    protected readonly eval = eval;
}
