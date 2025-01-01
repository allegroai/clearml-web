import { Component } from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListItem, MatNavList} from '@angular/material/list';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'sm-enterprise',
  standalone: true,
  imports: [
    MatSidenavModule,
    MatListItem,
    RouterOutlet,
    RouterLinkActive,
    RouterLink,
    MatNavList,
    MatIcon
  ],
  templateUrl: './enterprise.component.html',
  styleUrls: ['../../settings/settings.component.scss', './enterprise.component.scss']
})
export class EnterpriseComponent {

}
