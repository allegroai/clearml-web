import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import { downloadFullLog } from '@common/experiments/actions/common-experiment-output.actions';
import {filter, map} from 'rxjs/operators';
import {HTTP} from '~/app.constants';


@Injectable()
export class ExperimentOutputEffects {

  constructor(private actions$: Actions) {
  }

  downloadFullLog$ = createEffect(() => this.actions$.pipe(
    ofType(downloadFullLog),
    filter(action => !!action.experimentId),
    map(action => {
      const a = document.createElement('a');
      a.href = `${HTTP.API_BASE_URL}/events.download_task_log?line_type=text&task=${action.experimentId}`;
      a.target = '_blank';
      a.download = 'Log';
      a.click();
    })
  ), {dispatch: false});
}
