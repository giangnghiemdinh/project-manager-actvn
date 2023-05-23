import { animate, AnimationTriggerMetadata, style, transition, trigger } from '@angular/animations';
import { AnimationDuration } from '../constants';

export const fadeMotion: AnimationTriggerMetadata = trigger('fadeMotion', [
  transition(':enter', [style({ opacity: 0, transform: 'translateY(10px)' }), animate(`${AnimationDuration.SLOW}`, style({ opacity: 1, transform: 'translateY(0px)' }))]),
  transition(':leave', [style({ opacity: 1 }), animate(`${AnimationDuration.BASE}`, style({ opacity: 0 }))])
]);
