import { inject, Injectable } from '@angular/core';
import { concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { catchError, map } from 'rxjs/operators';
import { mergeMap, of } from 'rxjs';
import { GeneralStatisticActions } from './general-statistic.actions';
import { AbstractEffects } from '../../../common/abstracts';
import { ProjectService } from '../../../common/services';
import { selectQueryParams } from '../../../common/stores/router';


@Injectable()
export class GeneralStatisticEffects extends AbstractEffects {

    readonly #projectService = inject(ProjectService);

    loadProjectStatistic$ = createEffect(() =>
        this.actions$.pipe(
            ofType(GeneralStatisticActions.loadProjectStatistic),
            concatLatestFrom(() => this.routerStore.select(selectQueryParams)),
            mergeMap(([_, params]) =>
                this.#projectService.getStatistical(params).pipe(
                    map((response) => GeneralStatisticActions.loadProjectStatisticSuccess({ response })),
                    catchError(errors => of(GeneralStatisticActions.loadProjectStatisticFailure({ errors })))
                )
            )
        )
    );
}
