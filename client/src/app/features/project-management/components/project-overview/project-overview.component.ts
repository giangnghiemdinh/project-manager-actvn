import { Component, inject } from '@angular/core';
import { ProjectStatusPipe, RankFullNamePipe } from '../../../../core-ui/pipes';
import { ToolbarComponent } from '../../../../core-ui/components';
import { AsyncPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { ProjectState, selectIsLoading, selectProject } from '../../store/project.reducer';
import { Store } from '@ngrx/store';
import { NavigationEnd, Router, RouterLink, Scroll } from '@angular/router';
import { filter, takeUntil, tap } from 'rxjs';
import { concatLatestFrom } from '@ngrx/effects';
import { selectRouterParam } from '../../../../common/stores/router';
import { RouterReducerState } from '@ngrx/router-store';
import { ProjectActions } from '../../store/project.actions';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { ProgressDetailPipe } from './progress-detail.pipe';
import { DestroyDirective, LetDirective } from '../../../../core-ui/directives';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { Title } from '@angular/platform-browser';
import { handleTitle } from '../../../../common/utilities';

@Component({
    selector: 'app-project-overview',
    standalone: true,
    imports: [ ProjectStatusPipe, ToolbarComponent, NgClass, NgIf, NzSpinModule, AsyncPipe, NgForOf, ProgressDetailPipe, LetDirective, NzToolTipModule, NzButtonModule, RouterLink, RankFullNamePipe ],
    templateUrl: './project-overview.component.html',
    hostDirectives: [ DestroyDirective ],
})
export class ProjectOverviewComponent {

    readonly #destroy$ = inject(DestroyDirective).destroy$;
    readonly #routerStore = inject(Store<RouterReducerState>);
    readonly #store = inject(Store<ProjectState>);
    readonly #router = inject(Router);
    readonly #title = inject(Title);

    project$ = this.#store
        .select(selectProject)
        .pipe(tap(project => {
            this.#title.setTitle(handleTitle(project?.name || 'Chi tiết đề tài'));
        }));
    isLoading$ = this.#store.select(selectIsLoading);

    constructor() {
        this.onLoad();
    }

    onLoad() {
        this.#router.events
            .pipe(
                filter(event => event instanceof Scroll && event.routerEvent instanceof NavigationEnd),
                concatLatestFrom(_ => this.#routerStore.select(selectRouterParam('id'))),
                takeUntil(this.#destroy$)
            )
            .subscribe(([_, id]) => {
                this.#store.dispatch(ProjectActions.loadProject({ payload: { id: +id, modal: '', extra: 'all' } }));
            });
    }
}
