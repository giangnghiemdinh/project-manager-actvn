import { Directive, inject, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { AuthLayoutComponent } from '../../layouts/auth-layout/auth-layout.component';

@Directive({
  selector: '[footer]',
  standalone: true
})
export class FooterDirective implements OnInit, OnDestroy {
    readonly #layout = inject(AuthLayoutComponent, { optional: true });
    readonly #elementRef = inject(TemplateRef<any>);

    ngOnInit() {
        if (!this.#elementRef || !this.#layout) { return; }
        this.#layout.footer = this.#elementRef;
        this.#layout.cdr.detectChanges();
    }

    ngOnDestroy(): void {
        if (!this.#elementRef || !this.#layout) { return; }
        this.#layout.footer = null;
        this.#layout.cdr.detectChanges();
    }

}
