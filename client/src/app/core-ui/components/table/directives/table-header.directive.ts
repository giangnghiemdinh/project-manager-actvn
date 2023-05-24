import { Directive, TemplateRef } from '@angular/core';

@Directive({
    selector: '[table-header]',
    standalone: true
})
export class TableHeaderDirective {

    constructor(
        public template: TemplateRef<any>
    ) {
    }

}
