import { Component } from '@angular/core';
import { NzResultModule } from 'ng-zorro-antd/result';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-page-not-permission',
  standalone: true,
  imports: [ NzResultModule, RouterLink, NzButtonModule ],
  templateUrl: './page-not-permission.component.html',
})
export class PageNotPermissionComponent {

}
