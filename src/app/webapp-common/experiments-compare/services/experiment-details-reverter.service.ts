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
    const {uri, content_size, hash, timestamp, display_data, type_data, ...restArtifact} = artifact;
    const result = {
      ...restArtifact,
      'file path': uri,
      'file size': content_size,
      'file hash': hash,
      'timestamp': timestamp
    };

    if (type_data) {
      result['content type'] = type_data['content_type'] || '';
      result['preview'] = type_data.preview && type_data.preview.trim().split('\n') || [];
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
      network_design: this.revertNetworkDesign(experiment.execution),
    };
  }

  revertNetworkDesign(execution) {
    let networkDesign = get('design.design', execution) || get('model_desc.design', execution) || get('model_desc.prototxt', execution);
    networkDesign = typeof networkDesign === 'string' ? networkDesign.split('\n') : {};
    return networkDesign;
  }

  revertExecution(experiment: ISelectedExperiment): ExecutionDetails {
    let pip = get('script.requirements.pip', experiment);
    let diff = get('script.diff', experiment);
    pip = (pip === undefined || Array.isArray(pip)) ? pip : pip.split('\n');
    pip = pip?.filter(row => !row.startsWith('#') && row.length > 0); // Should we remove comments????

    diff = (!diff || Array.isArray(diff)) ? diff : diff.split('\n');

    let base_docker_image = get('execution.docker_cmd', experiment) || '';
    // base_docker_image = base_docker_image ? {'': base_docker_image} : undefined;

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
      tag_name: script.tag
    };
  }

}
