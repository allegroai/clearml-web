import {Injectable} from '@angular/core';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';
import {IExecutionForm, sourceTypesEnum} from '~/features/experiments/shared/experiment-execution.model';
import {Task} from '~/business-logic/model/tasks/task';
import {Script} from '~/business-logic/model/tasks/script';
import {IExperimentModelInfo} from '../common-experiment-model.model';
import {Store} from '@ngrx/store';
import {ExperimentsViewState} from '@common/experiments/reducers/experiments-view.reducer';
import {selectActiveWorkspace} from '@common/core/reducers/users-reducer';
import {Observable, Subscription} from 'rxjs';
import {isExample} from '@common/shared/utils/shared-utils';
import {ITask} from '~/business-logic/model/al-task';
import {isSharedAndNotOwner} from '@common/shared/utils/is-shared-and-not-owner';

@Injectable({providedIn: 'root'})
export class CommonExperimentReverterService {
  private activeWorkSpace$: Observable<any>;
  private activeWorkSpace: any;
  private activeWorkSpaceSubscription: Subscription;

  constructor(private store: Store<ExperimentsViewState>) {
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
      configuration: experiment.configuration,
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
        destination: experiment.output?.destination ?? '',
        logLevel: 'basic'// TODO: should be enum from gencode.
      },
      requirements: experiment.script ? this.revertRequirements(experiment.script) : {pip: ''},
      diff: experiment.script?.diff ?? '',
      docker_cmd: experiment.container?.['docker_cmd'],
      queue: experiment.execution?.queue,
      container: experiment.container || {setup_shell_script: '', arguments: '', image: ''}
      /* eslint-enable @typescript-eslint/naming-convention */
    };
  }

  revertExecutionSource(script: Task['script']): IExecutionForm['source'] {
    return {
      /* eslint-disable @typescript-eslint/naming-convention */
      repository: script?.repository ?? '',
      tag: script?.tag ?? '',
      version_num: script?.version_num ?? '',
      branch: script?.branch ?? '',
      entry_point: script?.entry_point ?? '',
      working_dir: script?.working_dir ?? '',
      scriptType: this.revertScriptType(script)
      /* eslint-enable @typescript-eslint/naming-convention */
    };
  }

  revertScriptType(script: Task['script']) {
    switch (true) {
      case !!script?.tag:
        return sourceTypesEnum.Tag;
      case !!script?.version_num:
        return sourceTypesEnum.VersionNum;
      default:
        return sourceTypesEnum.Branch;
    }
  }

  revertModel(experiment: ITask): IExperimentModelInfo {
    return {
      input: experiment.models?.input?.map(modelEx => ({...modelEx.model, taskName: modelEx.name})) || [],
      output: experiment.models?.output?.map(modelEx => ({...modelEx.model, taskName: modelEx.name})) || [],
      artifacts: experiment.execution?.artifacts ?? []
    };
  }

  private revertRequirements(script: Script) {
    const pip = script?.requirements?.['pip'] ?? [];
    return {
      ...script.requirements,
      pip: (Array.isArray(pip) ? pip.join('\n') : pip) || ''
    };
  }

}
