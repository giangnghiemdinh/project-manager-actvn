import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { LAYOUT_CONFIG } from '../../../../common/constants';
import { MenuComponent } from '../menu/menu.component';
import { User } from '../../../../common/models';
import { debounceTime, fromEvent, map, merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [
        MenuComponent
    ],
    templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
    @Input() profile: User | null = null;
    @Input() isFixedSidebar = true;
    @Input() isCollapsedSidebar = false;
    @Output() isFixedSidebarChange = new EventEmitter<boolean>();
    @Output() isCollapsedSidebarChange = new EventEmitter<boolean>();
    CONFIG = LAYOUT_CONFIG;

    constructor(
        private readonly elementRef: ElementRef<HTMLElement>
    ) { this.mouseEventListener(); }

    private mouseEventListener() {
        const { nativeElement } = this.elementRef;
        merge(
            fromEvent(nativeElement, 'mouseenter').pipe(map(_ => false)),
            fromEvent(nativeElement, 'mouseleave').pipe(map(_ => true))
        ).pipe(
            debounceTime(160),
            takeUntilDestroyed()
        ).subscribe(value => !this.isFixedSidebar && this.isCollapsedSidebarChange.emit(value));
    }
}
