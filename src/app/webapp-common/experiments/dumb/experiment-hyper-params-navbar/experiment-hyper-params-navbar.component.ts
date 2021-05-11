import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
import {Params} from '@angular/router';
import {get} from 'lodash/fp';

type ActiveSection = 'hyper-param' | 'configuration';
export const ACTIVE_SECTIONS = {
  'hyper-param'  : 'hyper-param' as ActiveSection,
  configuration: 'configuration' as ActiveSection,
};

@Component({
  selector   : 'sm-experiment-hyper-params-navbar',
  templateUrl: './experiment-hyper-params-navbar.component.html',
  styleUrls  : ['./experiment-hyper-params-navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentHyperParamsNavbarComponent {
  public ACTIVE_SECTIONS = ACTIVE_SECTIONS;
  sectionReplaceMap= {
    _legacy:'General',
    properties: 'User Properties',
    design: 'General'
  };
  encodeURI = encodeURI;
  @Input() hyperParams: { [key: string]: any};
  @Input() configuration: { [key: string]: any};
  @Input() selectedObject;
  public activeSection: string;

  @Input() set routerConfig(routerConfig: string) {
    this.activeSection = routerConfig;
    this.changeDetection.detectChanges();
  }
  @Input() disableAdd = true;

  public selectedHyperParam: string;

  @Input() set routerParams(routerParams: Params) {
    this.selectedHyperParam = get('hyperParamId', routerParams);
    this.selectedObject = decodeURIComponent(routerParams?.configObject);
    this.changeDetection.detectChanges();
  };

  @Output() artifactSelected = new EventEmitter();

  constructor(private changeDetection: ChangeDetectorRef,) {
  }


}
