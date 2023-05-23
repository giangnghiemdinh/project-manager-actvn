import { Directive, OnDestroy } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Directive({
    selector: 'onDestroy',
    standalone: true
})
export class DestroyDirective implements OnDestroy {

    private _destroy$ = new ReplaySubject<void>(1);

    get destroy$() {
        return this._destroy$.asObservable();
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

}
