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
        id            : exp.id,
        name          : exp.name,
        status        : exp.status,
        last_iteration: exp.last_iteration,
        last_update   : exp.last_update,
        project       : exp.project,
        completed     : exp.completed,
        tags          : exp.tags,
        execution     : this.revertExecution(exp),
        artifacts     : this.revertArtifacts(exp),
        parameters    : get('execution.parameters', exp) ?
          this.revertExecutionParameters(exp.execution.parameters) :
          undefined,
      };
    });
  }

  protected sortObjectByKey(obj) {
    const orderedLabels = {};
    Object.keys(obj).sort().forEach((key) => {
      orderedLabels[key] = obj[key];
    });

    return orderedLabels;
  }

  public revertExecutionParameters(parameters: Execution['parameters']) {
    return this.sortObjectByKey(parameters);
  }

  abstract revertArtifacts(exp: ISelectedExperiment);

  abstract revertExecution(exp: ISelectedExperiment);

}
