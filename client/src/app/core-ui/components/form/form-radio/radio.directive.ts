import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
    selector: '[radio]',
    standalone: true
})
export class RadioDirective {
    @Input('radio') value: any;
    @Input() className = '';

    constructor(
        public label: TemplateRef<any>
    ) { }
}
