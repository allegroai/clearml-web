import {Injectable} from '@angular/core';
import {IExperimentInfo} from '../../../../features/experiments/shared/experiment-info.model';
import {IExecutionForm, sourceTypesEnum} from '../../../../features/experiments/shared/experiment-execution.model';
import {get, getOr} from 'lodash/fp';
import {Execution} from '../../../../business-logic/model/tasks/execution';
import {Task} from '../../../../business-logic/model/tasks/task';
import {Script} from '../../../../business-logic/model/tasks/script';
import {IExperimentModelInfo} from '../common-experiment-model.model';
import {Store} from '@ngrx/store';
import {IExperimentsViewState} from '../../../../features/experiments/reducers/experiments-view.reducer';
import {selectActiveWorkspace} from '../../../core/reducers/users-reducer';
import {Observable, Subscription} from 'rxjs';
import {isExample, isSharedAndNotOwner} from '../../../shared/utils/shared-utils';
import {ITask} from '../../../../business-logic/model/al-task';

@Injectable({providedIn: 'root'})
export class CommonExperimentReverterService {
  private activeWorkSpace$: Observable<any>;
  private activeWorkSpace: any;
  private activeWorkSpaceSubscription: Subscription;

  constructor(private store: Store<IExperimentsViewState>) {
    this.activeWorkSpace$ = this.store.select(selectActiveWorkspace);
    this.activeWorkSpaceSubscription = this.activeWorkSpace$.subscribe(activeWorkSpace => {
      this.activeWorkSpace = activeWorkSpace;
    });
  }

  public revertReadOnly(experiment): Task {
    experiment.readOnly = isExample(experiment) || isSharedAndNotOwner(experiment, this.activeWorkSpace);
    return experiment;
  }

  commonRevertExperiment(experiment: ITask): IExperimentInfo {
    return {
      id: experiment.id,
      name: experiment.name,
      comment: experiment.comment,
      readonly: isExample(experiment) || isSharedAndNotOwner(experiment, this.activeWorkSpace),
      execution: this.revertExecution(experiment),
      model: this.revertModel(experiment),
      hyperparams: this.revertHyperParams(experiment.hyperparams),
      status: experiment.status,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      container: experiment.container || {image: '', setup_shell_script: '', arguments: ''}
    };
  }

  revertHyperParams(hyperparams) {
    if (!hyperparams) {
      hyperparams = {};
    }
    if (!('properties' in hyperparams)) {
      hyperparams['properties'] = {};
    }
    return hyperparams;
  }


  revertExecution(experiment: ITask): IExecutionForm {
    return {
      /* eslint-disable @typescript-eslint/naming-convention */
      source: this.revertExecutionSource(experiment.script),
      output: {
        destination: get('destination', experiment.output) || '',
        logLevel: 'basic'// TODO: should be enum from gencode.
      },
      requirements: experiment.script ? this.revertRequirements(experiment.script) : {pip: ''},
      diff: get('diff', experiment.script) || '',
      docker_cmd: get('docker_cmd', experiment.execution),
      queue: experiment.execution?.queue,
      container: experiment.container || {setup_shell_script: '', arguments: '', image: ''}
      /* eslint-enable @typescript-eslint/naming-convention */
    };
  }

  revertExecutionParameters(parameters: Execution['parameters']): Array<{ label: any; key: string }> {
    return parameters ?
      Object.entries(parameters).map(([key, val]) => ({label: val, key}))
        .sort((p, c) => p.key < c.key ? -1 : 1) :
      [];
  }

  revertExecutionSource(script: Task['script']): IExecutionForm['source'] {
    return {
      /* eslint-disable @typescript-eslint/naming-convention */
      repository: get('repository', script) || '',
      tag: get('tag', script) || '',
      version_num: get('version_num', script) || '',
      branch: get('branch', script) || '',
      entry_point: get('entry_point', script) || '',
      working_dir: get('working_dir', script) || '',
      scriptType: this.revertScriptType(script)
      /* eslint-enable @typescript-eslint/naming-convention */
    };
  }

  revertScriptType(script: Task['script']) {
    switch (true) {
      case !!get('tag', script):
        return sourceTypesEnum.Tag;
      case !!get('version_num', script):
        return sourceTypesEnum.VersionNum;
      default:
        return sourceTypesEnum.Branch;
    }
  }

  revertModel(experiment: ITask): IExperimentModelInfo {
    return {
      input: experiment.models?.input?.map(modelEx => ({...modelEx.model, taskName: modelEx.name})) || [],
      output: experiment.models?.output?.map(modelEx => ({...modelEx.model, taskName: modelEx.name})) || [],
      artifacts: get('artifacts', experiment.execution) || []
    };
  }

  private revertRequirements(script: Script) {
    const pip = getOr([], 'requirements.pip', script);
    return {
      ...script.requirements,
      pip: (Array.isArray(pip) ? pip.join('\n') : pip) || ''
    };
  }

}
