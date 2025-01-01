import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'sm-serving-empty-state',
  standalone: true,
  imports: [
    RouterLink,
    MatIcon
  ],
  templateUrl: './serving-empty-state.component.html',
  styleUrl: './serving-empty-state.component.scss'
})
export class ServingEmptyStateComponent {

}
