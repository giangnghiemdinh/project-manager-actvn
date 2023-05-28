import { createFeature, createReducer, on } from '@ngrx/store';
import { GeneralStatisticActions } from './general-statistic.actions';
import { AbstractState } from '../../../common/abstracts';
import { ProjectStatisticalResponse } from '../../../common/models';

export interface GeneralStatisticState extends AbstractState {
    projectStatistic: ProjectStatisticalResponse | null;
}

export const initialState: GeneralStatisticState = {
    projectStatistic: null,
    isLoading: false,
    errors: null
};

export const generalStatisticFeature = createFeature({
    name: 'general-statistic',
    reducer: createReducer(
        initialState,
        on(GeneralStatisticActions.loadProjectStatistic, state => ({
            ...state,
            isLoading: true
        })),
        on(GeneralStatisticActions.loadProjectStatisticSuccess, (state, { response }) => ({
            ...state,
            isLoading: false,
            projectStatistic: response
        })),
        on(GeneralStatisticActions.loadProjectStatisticFailure, (state, { errors }) => ({
            ...state,
            isLoading: false,
            errors
        })),
    )
});

export const {
    selectIsLoading,
    selectProjectStatistic,
    selectErrors,
} = generalStatisticFeature;
