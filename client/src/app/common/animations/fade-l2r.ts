import { animate, AnimationTriggerMetadata, style, transition, trigger } from '@angular/animations';
import { AnimationDuration } from '../constants';

export const fadeL2rMotion: AnimationTriggerMetadata = trigger('fadeL2rMotion', [
    transition(':enter',
        [ style({
            opacity: 0,
            transform: 'translateX(20px)'
        }), animate(`${ AnimationDuration.SLOW } {{delay}}s`, style({ opacity: 1, transform: 'translateX(0px)' })) ],
        { params: { delay: 0 } }),
    transition(':leave', [ style({ opacity: 1 }), animate(`${ AnimationDuration.BASE }`, style({ opacity: 0 })) ])
]);
