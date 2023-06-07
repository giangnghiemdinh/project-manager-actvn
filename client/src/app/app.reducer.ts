import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import { RouterUrl } from './common/models';
import { authReducer, AuthState, commonReducer, CommonState, settingsReducer, SettingsState } from './common/stores';
import { ActionReducerMap, MetaReducer } from '@ngrx/store/src/models';
import { storageMetaReducer } from './common/utilities';

export interface AppState {
    router: RouterReducerState<RouterUrl>;
    auth: AuthState;
    common: CommonState;
    settings: SettingsState;
}

export const appReducers: ActionReducerMap<AppState> = {
    router: routerReducer,
    auth: authReducer,
    common: commonReducer,
    settings: settingsReducer
}

export const metaReducers: MetaReducer<AppState>[] = [
    storageMetaReducer
];
