import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {map, switchMap, withLatestFrom} from 'rxjs/operators';
import {getResultsCount, setResultsCount} from '@common/dashboard-search/dashboard-search.actions';
import {getEntityStatQuery} from '@common/dashboard-search/dashboard-search.effects';
import {ApiOrganizationService} from '~/business-logic/api-services/organization.service';
import {Store} from '@ngrx/store';
import {selectCurrentUser, selectShowOnlyUserWork} from '@common/core/reducers/users-reducer';
import {selectHideExamples, selectShowHidden} from '@common/core/reducers/projects.reducer';


@Injectable()
export class DashboardSearchEffects {
  constructor(
    private actions: Actions,
    private store: Store,
    private organizationApi: ApiOrganizationService,
  ) {}

  getResultsCount = createEffect(() => this.actions.pipe(
    ofType(getResultsCount),
    withLatestFrom(
      this.store.select(selectShowOnlyUserWork),
      this.store.select(selectCurrentUser),
      this.store.select(selectShowHidden),
      this.store.select(selectHideExamples),
    ),
    switchMap(([action, userFocus, user, hidden, hideExamples]) => this.organizationApi.organizationGetEntitiesCount({
      /* eslint-disable @typescript-eslint/naming-convention */
      ...(userFocus && {active_users: [user.id]}),
      ...(hidden && {search_hidden: true}),
      ...(hideExamples && {allow_public: false}),
      ...getEntityStatQuery(action, hidden)
      /* eslint-enable @typescript-eslint/naming-convention */
    })),
    map(({tasks: experiments, ...rest}) =>
      setResultsCount({counts: {...rest, experiments}}))
  ));

}
