import {ISelectedExperiment} from '../experiments/shared/experiment-info.model';
import {ConfigurationItem} from '../../business-logic/model/tasks/configurationItem';
import {ITask} from '../../business-logic/model/al-task';

export abstract class ExperimentDetailsReverterServiceBase {
  public experimentReverter;

  constructor(experimentReverter) {
    this.experimentReverter = experimentReverter;
  }


  revertExperiments(experimentIds: Array<string>, experiments: ITask[]) {
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
        configuration: this.revertconfiguration(exp.configuration)
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

  private revertconfiguration(configuration: {[p: string]: ConfigurationItem}) {
    if (!configuration) {
      return {};
    }
    return Object.entries(configuration).reduce((acc, [key, value]) => {
      if (key === 'design' && value.type === 'legacy') {
        acc['General'] = value;
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});
  }

  abstract revertArtifacts(exp: ITask);

  abstract revertExecution(exp: ITask);
}
