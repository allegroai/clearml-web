import {Injectable} from '@angular/core';
import {TasksEditRequest} from '../../../../business-logic/model/tasks/tasksEditRequest';
import {IExperimentInfo, ISelectedExperiment} from '../experiment-info.model';
import {IExecutionForm} from '../experiment-execution.model';
import {Execution} from '../../../../business-logic/model/tasks/execution';
import {isEqual} from 'lodash/fp';
import {CommonExperimentConverterService} from '../../../../webapp-common/experiments/shared/services/common-experiment-converter.service';
import {IHyperParamsForm} from '../../../../webapp-common/experiments/shared/experiment-hyper-params.model';
import {IExperimentModelInfo} from '../../../../webapp-common/experiments/shared/common-experiment-model.model';


@Injectable()
export class ExperimentConverterService {

  constructor(private commonExperimentConverterService: CommonExperimentConverterService) {
  }


  convertExperiment(experimentInfo: IExperimentInfo, selectedExperiment: IExperimentInfo, experimentInfoBeforeChange: IExperimentInfo): TasksEditRequest {
    const convertedExperiment                   = this.commonExperimentConverterService.convertCommonExperiment(experimentInfo, selectedExperiment, experimentInfoBeforeChange);

    const executionInfoNoOutputDest             = {...experimentInfo.execution, output: {...experimentInfo.execution.output, destination: null}};
    const executionInfoNoOutputDestBeforeChange = {...experimentInfoBeforeChange.execution, output: {...experimentInfoBeforeChange.execution.output, destination: null}};

    if (!isEqual(executionInfoNoOutputDest, executionInfoNoOutputDestBeforeChange) ||
      !isEqual(experimentInfo.model, experimentInfoBeforeChange.model) ||
      !isEqual(experimentInfo.hyperparams, experimentInfoBeforeChange.hyperparams) ||
      !isEqual(experimentInfo.model, experimentInfoBeforeChange.model)
    ) {
      convertedExperiment.execution = this.convertExecution(experimentInfo.execution,
        experimentInfo.model);
    }
    return convertedExperiment;
  }

  convertExecution(execution: IExecutionForm, model: IExperimentModelInfo): Execution {
    return {
      ...this.commonExperimentConverterService.commonConvertExecution(execution, model),
    };
  }

}
