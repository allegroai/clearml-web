import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector       : 'sm-experiments',
  templateUrl    : './experiments.component.html',
  styleUrls      : ['./experiments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentsComponent {}
