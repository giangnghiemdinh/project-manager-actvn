import {animate, AnimationTriggerMetadata, state, style, transition, trigger} from '@angular/animations';
import { AnimationCurves } from '../constants';


export const collapseMotion: AnimationTriggerMetadata = trigger('collapseMotion', [
  state('expanded', style({ height: '*' })),
  state('collapsed', style({ height: 0, overflow: 'hidden' })),
  state('hidden', style({ height: 0, overflow: 'hidden', borderTopWidth: '0' })),
  transition('expanded => collapsed', animate(`300ms ${AnimationCurves.EASE_IN_OUT}`)),
  transition('expanded => hidden', animate(`300ms ${AnimationCurves.EASE_IN_OUT}`)),
  transition('collapsed => expanded', animate(`300ms ${AnimationCurves.EASE_IN_OUT}`)),
  transition('hidden => expanded', animate(`300ms ${AnimationCurves.EASE_IN_OUT}`))
]);
