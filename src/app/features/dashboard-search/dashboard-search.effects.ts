import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {ApiProjectsService} from '~/business-logic/api-services/projects.service';
import {map, switchMap} from 'rxjs/operators';
import {getResultsCount, setResultsCount} from '@common/dashboard-search/dashboard-search.actions';
import {getEntityStatQuery} from '@common/dashboard-search/dashboard-search.effects';
import {ApiOrganizationService} from '~/business-logic/api-services/organization.service';


@Injectable()
export class DashboardSearchEffects {
  constructor(
    private actions: Actions,
    public projectsApi: ApiProjectsService,
    public organizationApi: ApiOrganizationService,
  ) {
  }

  getResultsCount = createEffect(() => this.actions.pipe(
    ofType(getResultsCount),
    switchMap(action => this.organizationApi.organizationGetEntitiesCount(getEntityStatQuery(action))),
    map(({tasks: experiments,  ...rest}) =>
      setResultsCount({counts: {...rest, experiments}}))
  ));

}
