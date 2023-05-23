import { Directive, ElementRef, HostListener, Inject, Input, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: '[input-parser]',
    standalone: true
})
export class InputParserDirective {

    @Input() upperCase = false;
    @Input() lowerCase = false;
    @Input() parser?: (value: string) => string;

    constructor(
        private readonly element: ElementRef,
        @Optional()
        @Self()
        @Inject(NgControl)
        private readonly ngControl: NgControl | null,
    ) {
    }

    @HostListener('input', [ '$event' ])
    @HostListener('focus', [ '$event' ])
    @HostListener('keypress', [ '$event' ])
    @HostListener('cut', [ '$event' ])
    @HostListener('paste', [ '$event' ])
    @HostListener('blur', [ '$event' ])
    onChange(event: any) {
        if (!this.parser && !this.upperCase && !this.lowerCase) {
            return;
        }
        const value = this.formatValue(event.target.value);
        if (this.ngControl) {
            this.ngControl.control?.setValue(value);
        } else {
            this.element.nativeElement.value = value;
        }
    }

    private formatValue(value: any) {
        if (!value) {
            return '';
        }
        if (!!this.parser) {
            value = this.parser(value);
        }
        if (this.upperCase) {
            value = value.toUpperCase();
        }
        if (this.lowerCase) {
            value = value.toLowerCase();
        }
        return value;
    }
}
