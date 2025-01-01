import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

@Component({
  selector: 'sm-loading-button',
  templateUrl: './loading-button.component.html',
  styleUrls: ['./loading-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatButton,
    MatIcon,
    MatProgressSpinner
  ]
})
export class LoadingButtonComponent {
  label = input('CREATE NEW');
  disabled = input(false);
  loading = input<boolean>();
}
