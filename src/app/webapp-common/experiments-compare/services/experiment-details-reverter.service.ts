import {Injectable} from '@angular/core';
import {ExperimentReverterService} from '../../../features/experiments/shared/services/experiment-reverter.service';
import {get} from 'lodash/fp';
import {ExecutionDetails, ModelDetails} from '../shared/experiments-compare-details.model';
import {Task} from '../../../business-logic/model/tasks/task';
import {ExperimentDetailsReverterServiceBase} from '../../../features/experiments-compare/experiment-details-reverter-service.base';
import {ARTIFACTS_TYPES} from '../../tasks/tasks.constants';
import {Artifact} from '../../../business-logic/model/tasks/artifact';
import {crc32} from '../../shared/utils/shared-utils';
import {TaskModelItem} from '../../../business-logic/model/tasks/taskModelItem';
import {IModelInfo} from '../../experiments/shared/common-experiment-model.model';
import {ITask} from '../../../business-logic/model/al-task';

@Injectable({
  providedIn: 'root'
})
export class ExperimentDetailsReverterService extends ExperimentDetailsReverterServiceBase {

  constructor(public experimentReverter: ExperimentReverterService) {
    super(experimentReverter);
  }

  revertArtifacts(experiment: ITask): any {
    const result = {
      ' input models': this.revertModels(experiment.models.input),
      ' output models': this.revertModels(experiment.models.output)
    };
    experiment.execution.artifacts.forEach(artifact => result[artifact.key] = this.revertArtifact(artifact));
    return result;
  }

  revertArtifact(artifact: Artifact): any {
    if (artifact.type === ARTIFACTS_TYPES.AUDIT_LOG) {
      return this.revertAuditLog(artifact);
    }

    // Currently we have only audit_log so:
    return this.revertAuditLog(artifact);
  }

  revertAuditLog(artifact: Artifact): any {
    const {uri, content_size, hash, timestamp, display_data, mode, key, type_data, ...restArtifact} = artifact;
    const result = {
      ...restArtifact,
      'file size': content_size,
      'file hash': hash,
    };

    if (type_data) {
      const preview  = type_data.preview && type_data.preview.trim().split('\n') || [];
      result['content type'] = type_data['content_type'] || '';
      result['preview'] = (preview.length < 3000 && preview[0]?.length < 3000) ? preview : [`** Content is too large to display. Hash: ${crc32(type_data.preview)}`];
      result['data hash'] = type_data.data_hash || '';
    }
    display_data.forEach(pair => result[pair[0]] = pair[1]);

    return result;
  }

  revertModels(models: TaskModelItem[]) {
    return models.reduce((acc, model) => {
      acc[model.name] = this.revertModel(model);
      return acc;
    }, {});
  }

  revertModel(model: TaskModelItem): ModelDetails {
    return {
      model: this.revertModelInput(model),
      network_design: this.revertNetworkDesign(model.model),
    };
  }

  revertNetworkDesign(model): string {
    let networkDesign = model?.design?.design || model?.design;
    networkDesign = typeof networkDesign === 'string' ? networkDesign.split('\n') : {};
    return networkDesign;
  }

  revertExecution(experiment: ITask): ExecutionDetails {
    let pip = get('script.requirements.pip', experiment);
    pip = (pip === undefined || Array.isArray(pip)) ? pip : pip.split('\n');
    pip = pip?.filter(row => !row.startsWith('#') && row.length > 0); // Should we remove comments????

    let diff = get('script.diff', experiment);
    if (diff) {
      diff = (Array.isArray(diff)) ? diff : diff.split('\n');
      diff = (diff.length < 3000 && diff[0]?.length < 3000) ? diff : [`** Content is too large to display. Hash: ${crc32(get('script.diff', experiment))}`];
    }

    return {
      source: experiment.script ? this.revertExecutionSource(experiment.script) : undefined,
      uncommitted_changes: diff,
      installed_packages: pip,
      container: {
        image: experiment.container?.image || '',
        arguments: experiment.container?.arguments || '',
        setup_shell_script: experiment.container?.setup_shell_script?.split('\n') || []
      }
    };
  }


  public revertModelInput(model: TaskModelItem): IModelInfo {
    return {
      id: get('model.id', model),
      name: get('model.name', model),
      // taskName: get('name', model),
      uri: get('model.uri', model),
      framework: get('framework', model) || get('model.framework', model)
    };
  }

  public revertExecutionSource(script: Task['script']) {
    return {
      binary: script.binary,
      repository: script.repository,
      working_dir: script.working_dir,
      script_path: script.entry_point,
      branch: script.branch,
      commit_id: script.version_num,
      tag_name: script.tag || '' // In tag_name we want undefined == null == ""
    };
  }

}
