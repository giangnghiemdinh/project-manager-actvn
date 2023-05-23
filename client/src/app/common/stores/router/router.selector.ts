import { RouterReducerState } from '@ngrx/router-store';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RouterUrl } from '../../models';

export const routerStateKey = 'router'

const selectRouterSlice = createFeatureSelector<
  RouterReducerState<RouterUrl>
>(routerStateKey);

export const selectQueryParams = createSelector(
  selectRouterSlice,
  (router) => (router && router.state  && router.state.queryParams || {}),
);

export const selectRouteParams = createSelector(
  selectRouterSlice,
  (router) => (router && router.state && router.state.params) || {},
);

export const selectRouterParam = (paramName: string) =>
  createSelector(selectRouteParams, (params) => params[paramName]);
