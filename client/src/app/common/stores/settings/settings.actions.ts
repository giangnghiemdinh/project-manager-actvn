import { createActionGroup, emptyProps, props } from '@ngrx/store';

export type Theme = 'light' | 'dark' | 'system';

export const SettingsActions = createActionGroup({
    source: 'Settings',
    events: {
        'Initial Theme': emptyProps(),

        'Change Theme': props<{ theme: Theme }>(),
        'Change Theme Success': props<{ theme: Theme, activeTheme: 'light' | 'dark' }>(),
        'Change Theme Failure': props<{ errors: any }>(),

        'Change Fixed Sidebar': props<{ isFixed: boolean }>()
    }
});
