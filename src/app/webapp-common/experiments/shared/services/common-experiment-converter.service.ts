import {Injectable} from '@angular/core';
import {IExperimentInfo, ISelectedExperiment} from '../../../../features/experiments/shared/experiment-info.model';
import {TasksEditRequest} from '../../../../business-logic/model/tasks/tasksEditRequest';
import {get, getOr, isEqual} from 'lodash/fp';
import {IExecutionForm} from '../../../../features/experiments/shared/experiment-execution.model';
import {Execution} from '../../../../business-logic/model/tasks/execution';
import {IExperimentModelInfo} from '../common-experiment-model.model';


@Injectable()
export class CommonExperimentConverterService {

  constructor() {
  }

  convertCommonExperiment(experimentInfo: IExperimentInfo, selectedExperiment: IExperimentInfo, experimentInfoBeforeChange: IExperimentInfo): TasksEditRequest {
    const convertedExperiment: TasksEditRequest = {
      task: selectedExperiment.id,
      type: selectedExperiment.type,
    };
    if (!isEqual(experimentInfo.name, experimentInfoBeforeChange.name)) {
      convertedExperiment.name = experimentInfo.name;
    }
    if (!isEqual(experimentInfo.comment, experimentInfoBeforeChange.comment)) {
      convertedExperiment.comment = experimentInfo.comment;
    }
    return convertedExperiment;
  }

  commonConvertExecution(execution: IExecutionForm, model: IExperimentModelInfo): Execution {
    return {
      framework : get('input.framework', model),
      docker_cmd: get('docker_cmd', execution)
    };
  }
}


