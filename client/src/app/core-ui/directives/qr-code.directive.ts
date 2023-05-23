import { Directive, ElementRef, inject, Input } from '@angular/core';
import * as QRCode from 'qrcode';

@Directive({
    selector: '[qrCode]',
    standalone: true
})
export class QrCodeDirective {

    private readonly elementRef = inject(ElementRef);

    @Input()
    set url(text: string) {
        this.generate(text);
    }

    private generate(text: string) {
        if (!this.elementRef) { return; }
        const element: HTMLImageElement = this.elementRef.nativeElement;
        QRCode.toDataURL(text, (err, url) => {
            if (err) {
                console.warn(`Cannot convert ${this.url} to QR`, err);
                return;
            }
            element.src = url;
        });
    }
}
