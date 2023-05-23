import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[table-cell]',
  standalone: true
})
export class TableCellDirective {

  constructor(
    public template: TemplateRef<any>
  ) { }

}
