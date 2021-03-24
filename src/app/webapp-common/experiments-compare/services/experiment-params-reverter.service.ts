import {Injectable} from '@angular/core';
import {get} from 'lodash/fp';
import {groupHyperParams} from '../../shared/utils/shared-utils';


@Injectable({
  providedIn: 'root'
})
export class ExperimentParamsReverterService {

  constructor() {
  }

  revertExperiments(experimentIds: Array<string>, experiments: any[]) {
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
        hyperparams: get('hyperparams', exp) ? exp.hyperparams : {},
      };
    });
  }
}
