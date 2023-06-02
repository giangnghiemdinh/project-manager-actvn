import { inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

export function setTitle(title: string) {
    const service = inject(Title);
    if (!service) { return; }
    service.setTitle(handleTitle(title));
}

export function handleTitle(title: string) {
    return `${title} | Học viện Kỹ thuật mật mã`;
}
