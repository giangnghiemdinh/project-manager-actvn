import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ProjectStatisticalResponse } from '../../../common/models';

export const GeneralStatisticActions = createActionGroup({
  source: 'General Statistic',
  events: {
    'Load Project Statistic': emptyProps(),
    'Load Project Statistic Success': props<{ response: ProjectStatisticalResponse }>(),
    'Load Project Statistic Failure': props<{ errors: any }>(),
  }
});
