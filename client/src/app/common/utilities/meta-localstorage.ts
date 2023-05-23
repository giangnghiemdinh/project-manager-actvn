import { Action, ActionReducer, INIT, UPDATE } from '@ngrx/store';
import { loadInitialState } from './local-storage';

export function storageMetaReducer<AppState>(reducer: ActionReducer<AppState>) {
    return function (state: AppState | undefined, action: Action) {
        const newState = reducer(state, action);
        if ([INIT.toString(), UPDATE.toString()].includes(action.type)) {
            return { ...newState, ...loadInitialState() };
        }
        return newState;
    };
}

