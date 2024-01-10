import { Component, Input } from '@angular/core';
import {NgIf} from '@angular/common';

@Component({
  selector: 'sm-neon-button',
  templateUrl: './neon-button.component.html',
  styleUrls: ['./neon-button.component.scss'],
  standalone: true,
  imports: [
    NgIf
  ]
})
export class NeonButtonComponent {
  @Input() label = 'CREATE NEW';
  @Input() disabled = false;
  @Input() iconClass;
}
