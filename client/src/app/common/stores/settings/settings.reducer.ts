import { createFeature, createReducer, on } from '@ngrx/store';
import { AbstractState } from '../../abstracts';
import { SettingsActions, Theme } from './settings.actions';

export interface SettingsState extends AbstractState {
    isFixedSidebar: boolean;
    theme: Theme;
    activeTheme: 'light' | 'dark';
}

export const initialState: SettingsState = {
    isFixedSidebar: true,
    theme: 'light',
    activeTheme: 'light',
    isLoading: false,
    errors: null
};

export const settingsFeature = createFeature({
    name: 'settings',
    reducer: createReducer(
        initialState,

        on(SettingsActions.changeFixedSidebar, (state, { isFixed }) => ({
            ...state,
            isFixedSidebar: isFixed,
        })),

        on(SettingsActions.changeTheme, (state) => ({
            ...state,
            isLoading: true,
        })),

        on(SettingsActions.changeThemeSuccess, (state, { theme, activeTheme }) => ({
            ...state,
            theme,
            activeTheme,
            isLoading: false,
        })),

        on(SettingsActions.changeThemeFailure, (state, { errors }) => ({
            ...state,
            errors,
            isLoading: false,
        })),
    ),
});

export const {
    reducer: settingsReducer,
    selectTheme,
    selectActiveTheme,
    selectIsFixedSidebar,
    selectIsLoading: selectSettingsLoading,
    selectErrors: selectSettingsErrors,
} = settingsFeature;

