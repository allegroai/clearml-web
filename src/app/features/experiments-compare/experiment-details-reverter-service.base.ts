import {ISelectedExperiment} from '../experiments/shared/experiment-info.model';
import {get} from 'lodash/fp';
import {Execution} from '../../business-logic/model/tasks/execution';

export abstract class ExperimentDetailsReverterServiceBase {
  public experimentReverter;

  constructor(experimentReverter) {
    this.experimentReverter = experimentReverter;
  }


  revertExperiments(experimentIds: Array<string>, experiments: Array<ISelectedExperiment>) {
    // map the experiment ids to keep the user order.
    return experimentIds.map(id => {
      const exp = experiments.find(ex => ex.id === id);
      return {
        id: exp.id,
        name: exp.name,
        status: exp.status,
        last_iteration: exp.last_iteration,
        last_update: exp.last_update,
        project: exp.project,
        completed: exp.completed,
        tags: exp.tags,
        execution: this.revertExecution(exp),
        artifacts: this.revertArtifacts(exp),
        configuration: exp.configuration
      };
    });
  }

  protected sortObjectByKey(obj) {
    const orderedLabels = {};
    Object.keys(obj).sort().forEach((key) => {
      orderedLabels[key] = typeof obj[key] === 'string' ? obj[key] : this.sortObjectByKey(obj[key]);
    });

    return orderedLabels;
  }

  abstract revertArtifacts(exp: ISelectedExperiment);

  abstract revertExecution(exp: ISelectedExperiment);
}
