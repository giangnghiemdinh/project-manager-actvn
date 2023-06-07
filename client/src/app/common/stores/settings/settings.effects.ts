import { inject, Injectable } from '@angular/core';
import { concatLatestFrom, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { AbstractEffects } from '../../abstracts';
import { selectIsFixedSidebar, selectTheme, SettingsState } from './settings.reducer';
import { catchError, from, map, of, switchMap, tap } from 'rxjs';
import { SettingsActions } from './settings.actions';
import { loadStyle, media, removeStyles, setLocalStorage } from '../../utilities';

@Injectable()
export class SettingsEffects extends AbstractEffects implements OnInitEffects {

    readonly #store = inject(Store<SettingsState>);

    initialTheme$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SettingsActions.initialTheme),
                concatLatestFrom(_ => this.#store.select(selectTheme)),
                map(([_, theme]) => SettingsActions.changeTheme({ theme }))
            )
    );

    changeTheme$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SettingsActions.changeTheme),
            map(action => action.theme),
            switchMap((theme) => theme === 'system' // switchMap will unsub obs if have new action dispatched
                ? media('(prefers-color-scheme: dark)').pipe(map(dark => ({ theme, dark })))
                : of({ theme, dark: theme === 'dark' })),
            switchMap(({ theme, dark }) => {
                if (!dark) {
                    removeStyles(['dark.css']);
                    document.body.classList.remove('dark');
                    return of(SettingsActions.changeThemeSuccess({ theme, activeTheme: 'light' }));
                }
                return from(loadStyle('/dark.css'))
                    .pipe(
                        map(_ => {
                            document.body.classList.add('dark');
                            return SettingsActions.changeThemeSuccess({ theme, activeTheme: 'dark' });
                        }),
                        catchError(errors => of(SettingsActions.changeThemeFailure({ errors: errors }))
                    ));
            })
        )
    );

    changeThemeSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SettingsActions.changeThemeSuccess),
                concatLatestFrom(_ => this.#store.select(selectIsFixedSidebar)),
                tap(([{ theme }, isFixedSidebar]) => {
                    setLocalStorage('Settings', JSON.stringify({ isFixedSidebar, theme }));
                }),
            ),
        { dispatch: false }
    );

    changeThemeFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SettingsActions.changeThemeFailure),
                tap((res) => {
                    this.raiseError('Thao tác không thành công! Vui lòng thử lại sau.');
                }),
            ),
        { dispatch: false }
    );

    changeFixedSidebar$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SettingsActions.changeFixedSidebar),
                map(action => action.isFixed),
                concatLatestFrom(_ => this.#store.select(selectTheme)),
                tap(([isFixedSidebar, theme]) => {
                    setLocalStorage('Settings', JSON.stringify({ isFixedSidebar, theme }));
                }),
            ),
        { dispatch: false }
    );

    ngrxOnInitEffects(): Action {
        return SettingsActions.initialTheme();
    }
}
