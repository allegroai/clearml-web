import {Injectable} from '@angular/core';
import {IExperimentInfo, ISelectedExperiment} from '../experiment-info.model';
import {CommonExperimentReverterService} from '../../../../webapp-common/experiments/shared/services/common-experiment-reverter.service';
import {ITask} from '../../../../business-logic/model/al-task';

@Injectable({providedIn: 'root'})
export class ExperimentReverterService {

  constructor(public commonExperimentReverterService: CommonExperimentReverterService) {
  }

  revertExperiment(experiment: ITask): IExperimentInfo {
    return {
      ...this.commonExperimentReverterService.commonRevertExperiment(experiment),
    };
  }

}
