import { Component } from '@angular/core';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [ NzResultModule, NzButtonModule, RouterLink ],
  templateUrl: './page-not-found.component.html',
})
export class PageNotFoundComponent {

}
