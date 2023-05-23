import { inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

export function setTitle(title: string) {
  const service = inject(Title);
  if (!service) { return; }
  service.setTitle(`${title} | Học viện Kỹ thuật mật mã`);
}
