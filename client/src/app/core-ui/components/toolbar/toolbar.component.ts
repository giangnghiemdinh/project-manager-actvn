import { Component, Input } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-toolbar',
    standalone: true,
    templateUrl: './toolbar.component.html',
    imports: [
        NgForOf,
        NgIf,
        RouterLink
    ]
})
export class ToolbarComponent {
    @Input() pageTitle = '';
    @Input() breadcrumbs: { title: string, url?: string, queryParams?: object }[] = [];

}
