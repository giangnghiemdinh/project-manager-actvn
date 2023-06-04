import { Component, Input, TemplateRef } from '@angular/core';
import { AsyncPipe, NgClass, NgIf, NgTemplateOutlet } from '@angular/common';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [
        NgIf,
        AsyncPipe,
        NgTemplateOutlet,
        NgClass
    ],
    templateUrl: './footer.component.html',
})
export class FooterComponent {
    @Input() left = 0;
    @Input() templateRef: TemplateRef<any> | null = null;
}
