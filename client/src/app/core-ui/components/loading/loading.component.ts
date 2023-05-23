import { Component, Input } from '@angular/core';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-loading',
    standalone: true,
    templateUrl: './loading.component.html',
    imports: [
        NzSpinModule,
        NgClass
    ],
    host: {
        class: 'w-full h-full'
    }
})
export class LoadingComponent {
    @Input() isLoading = false;
    @Input() simple = false;
    @Input() delay?: number;
    @Input() indicatorClass = '';
}
