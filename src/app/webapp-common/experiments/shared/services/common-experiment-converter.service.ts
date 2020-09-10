import {Injectable} from '@angular/core';
import {IExperimentInfo, ISelectedExperiment} from '../../../../features/experiments/shared/experiment-info.model';
import {TasksEditRequest} from '../../../../business-logic/model/tasks/tasksEditRequest';
import {get, getOr, isEqual} from 'lodash/fp';
import {IExecutionForm, sourceTypesEnum} from '../../../../features/experiments/shared/experiment-execution.model';
import {Execution} from '../../../../business-logic/model/tasks/execution';
import {Task} from '../../../../business-logic/model/tasks/task';
import {IHyperParamsForm} from '../experiment-hyper-params.model';
import {IExperimentModelInfo} from '../common-experiment-model.model';


@Injectable()
export class CommonExperimentConverterService {

  constructor() {
  }

  convertCommonExperiment(experimentInfo: IExperimentInfo, selectedExperiment: ISelectedExperiment, experimentInfoBeforeChange: IExperimentInfo): TasksEditRequest {
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
    if (!isEqual(experimentInfo.execution.source, experimentInfoBeforeChange.execution.source) ||
      !isEqual(experimentInfo.execution.requirements, experimentInfoBeforeChange.execution.requirements) ||
      !isEqual(experimentInfo.execution.diff, experimentInfoBeforeChange.execution.diff)
    ) {
      convertedExperiment.script = this.convertScript(experimentInfo.execution.source, experimentInfo.execution.requirements, experimentInfo.execution.diff);
    }
    if (!isEqual(experimentInfo.execution.output.destination, experimentInfoBeforeChange.execution.output.destination)) {
      convertedExperiment.output_dest = experimentInfo.execution.output.destination;
    }
    return convertedExperiment;

  }

  commonConvertExecution(execution: IExecutionForm, model: IExperimentModelInfo): Execution {
    return {
      model     : getOr(<string>null, 'input.id', model),
      framework : get('input.framework', model),
      docker_cmd: get('docker_cmd', execution)
    };
  }

  convertScript(source: IExecutionForm['source'], requirements: IExecutionForm['requirements'], diff: IExecutionForm['diff']): Task['script'] {
    const convertedRequirements = this.convertRequirments(requirements);
    const partialSourceA        = {
      repository  : source.repository,
      entry_point : source.entry_point,
      working_dir : source.working_dir,
      diff        : diff,
      requirements: convertedRequirements
    };
    const partialSourceB        = this.convertScriptType(source);
    return {...partialSourceA, ...partialSourceB};
  }

  convertScriptType(source: IExecutionForm['source']) {
    switch (source.scriptType) {
      case sourceTypesEnum.Branch:
        return {[sourceTypesEnum.Branch]: source.branch, [sourceTypesEnum.Tag]: '', [sourceTypesEnum.VersionNum]: ''};
      case sourceTypesEnum.Tag:
        return {[sourceTypesEnum.Branch]: source.branch, [sourceTypesEnum.Tag]: source.tag, [sourceTypesEnum.VersionNum]: ''};
      case sourceTypesEnum.VersionNum:
        return {[sourceTypesEnum.Branch]: source.branch, [sourceTypesEnum.Tag]: source.tag, [sourceTypesEnum.VersionNum]: source.version_num};
    }
  }

  private convertRequirments(requirements: any) {
    return {...requirements, pip: requirements.pip ? requirements.pip.split('\n') : undefined};
  }
}


