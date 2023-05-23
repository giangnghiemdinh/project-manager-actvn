import { Directive, ElementRef, inject, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
    selector: '[menuLinkActive]',
    standalone: true,
})
export class MenuLinkActiveDirective implements OnChanges {

    private readonly router = inject(Router);
    private readonly element = inject(ElementRef);
    private readonly renderer = inject(Renderer2);

    @Input() menuLinkActive = '';
    @Input() isCollapsedSidebar = false;

    constructor() {
        this.routerListener();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.update();
    }

    private routerListener() {
        this.router
            .events
            .pipe(
                filter(ev => ev instanceof NavigationEnd),
                takeUntilDestroyed()
            )
            .subscribe(_ => this.update());
    }

    private update() {
        const isActive = this.menuLinkActive && this.isLinkActive(this.menuLinkActive);
        const element = this.element.nativeElement;
        this.renderer.removeClass(element, 'menu-active');
        this.renderer.removeClass(element, 'menu-active-collapsed');
        isActive && this.renderer.addClass(element, this.isCollapsedSidebar ? 'menu-active-collapsed' : 'menu-active');
    }

    private isLinkActive(url: string, extract = false) {
        return this.router.isActive(url, {
            paths: extract ? 'exact' : 'subset',
            queryParams: extract ? 'exact' : 'subset',
            fragment: 'ignored',
            matrixParams: 'ignored'
        });
    }
}
