import {Injectable} from '@angular/core';
import {IExperimentInfo, ISelectedExperiment} from '../experiment-info.model';
import {CommonExperimentReverterService} from '../../../../webapp-common/experiments/shared/services/common-experiment-reverter.service';

@Injectable({providedIn: 'root'})
export class ExperimentReverterService {

  constructor(private commonExperimentReverterService: CommonExperimentReverterService) {
  }

  revertExperiment(experiment: ISelectedExperiment): IExperimentInfo {
    return {
      ...this.commonExperimentReverterService.commonRevertExperiment(experiment),
    };
  }

}
