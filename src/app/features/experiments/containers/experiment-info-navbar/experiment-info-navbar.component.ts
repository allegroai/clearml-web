import {Component, Input} from '@angular/core';
import {FeaturesEnum} from '~/business-logic/model/users/featuresEnum';
import {selectRouterConfig} from '@common/core/reducers/router-reducer';
import {Store} from '@ngrx/store';
import {ExperimentInfoState} from '../../reducers/experiment-info.reducer';
import {Observable} from 'rxjs';


@Component({
  selector: 'sm-experiment-info-navbar',
  templateUrl: './experiment-info-navbar.component.html',
  styleUrls: ['./experiment-info-navbar.component.scss']
})
export class ExperimentInfoNavbarComponent {
  public featuresEnum = FeaturesEnum;
  public routerConfig$: Observable<string[]>;
  public baseInfoRoute: string[];
  public overflow: boolean;
  private _minimized: boolean;

  @Input() set minimized(minimized: boolean) {
    this.baseInfoRoute = minimized ? ['info-output'] : [];
    this._minimized = minimized;
  }
  get minimized() {
    return this._minimized;
  }

  @Input() splitSize: number;


  constructor(private store: Store<ExperimentInfoState>) {
    this.routerConfig$ = this.store.select(selectRouterConfig);
  }
  navbarOverflowed($event: boolean) {
    this.overflow = $event;
  }
}
