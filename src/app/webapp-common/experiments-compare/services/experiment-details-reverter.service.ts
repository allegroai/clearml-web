import {Injectable} from '@angular/core';
import {ExperimentReverterService} from '../../../features/experiments/shared/services/experiment-reverter.service';
import {
  ISelectedExperiment, ISelectedExperimentOutput
} from '../../../features/experiments/shared/experiment-info.model';
import {get} from 'lodash/fp';
import {ExecutionDetails, ModelDetails} from '../shared/experiments-compare-details.model';
import {Task} from '../../../business-logic/model/tasks/task';
import {ExperimentDetailsReverterServiceBase} from '../../../features/experiments-compare/experiment-details-reverter-service.base';
import {ARTIFACTS_TYPES} from '../../tasks/tasks.constants';
import {Artifact} from '../../../business-logic/model/tasks/artifact';
import {crc32} from '../../shared/utils/shared-utils';

@Injectable({
  providedIn: 'root'
})
export class ExperimentDetailsReverterService extends ExperimentDetailsReverterServiceBase {

  constructor(public experimentReverter: ExperimentReverterService) {
    super(experimentReverter);
  }

  revertArtifacts(experiment: ISelectedExperiment): any {
    const result = {
      ' input model': this.revertModel(experiment),
      ' output model': this.revertOutputModel(experiment.output.model)
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

  revertOutputModel(model: ISelectedExperimentOutput['model']): ModelDetails {
    return {
      model: this.revertModelInput({model}),
      network_design: this.revertNetworkDesign(model),
    };
  }

  revertModel(experiment: ISelectedExperiment): ModelDetails {
    return {
      model: this.revertModelInput(experiment.execution),
      network_design: this.revertNetworkDesign(experiment.execution.model),
    };
  }

  revertNetworkDesign(model): string {
    let networkDesign = get('design.design', model) || get('design', model);
    networkDesign = typeof networkDesign === 'string' ? networkDesign.split('\n') : {};
    return networkDesign;
  }

  revertExecution(experiment: ISelectedExperiment): ExecutionDetails {
    let pip = get('script.requirements.pip', experiment);
    pip = (pip === undefined || Array.isArray(pip)) ? pip : pip.split('\n');
    pip = pip?.filter(row => !row.startsWith('#') && row.length > 0); // Should we remove comments????

    let diff = get('script.diff', experiment);
    if (diff) {
      diff = (Array.isArray(diff)) ? diff : diff.split('\n');
      diff = (diff.length < 3000 && diff[0]?.length < 3000) ? diff : [`** Content is too large to display. Hash: ${crc32(get('script.diff', experiment))}`];
    }
    const base_docker_image = get('execution.docker_cmd', experiment) || '';

    return {
      source: experiment.script ? this.revertExecutionSource(experiment.script) : undefined,
      uncommitted_changes: diff,
      installed_packages: pip,
      base_docker_image
    };
  }


  public revertModelInput(execution: any) {
    return {
      id: get('model.id', execution),
      name: get('model.name', execution),
      url: get('model.uri', execution),
      framework: execution?.framework || get('model.framework', execution)
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
