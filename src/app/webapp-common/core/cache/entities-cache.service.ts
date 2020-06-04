import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {EntitiesEnum} from '../../../business-logic/constants';
import {SmSyncStateSelectorService} from '../services/sync-state-selector.service';
import {getCacheEntityObj} from './get-entity';
import {IEntityObject} from './model';

@Injectable()
export class EntitiesCacheService {

  private readonly entities = [];

  constructor(private syncSelector: SmSyncStateSelectorService, private store: Store<any>) {
    this.entities.forEach(entity => {
      entity.stream$.subscribe(({instance, force}) => {
        this.sendRequest(instance, force);
      });
    });
  }

  public startUpdating(entityName: EntitiesEnum) {
    const entity = this.getEntityObj(entityName);
    entity.startPinging(false);
  }

  public stopUpdating(entityName: EntitiesEnum) {
    const entity = this.getEntityObj(entityName);
    entity.stopPinging();
  }

  public getEntity(entityName: EntitiesEnum, force = false) {
    const entity = this.getEntityObj(entityName);
    this.sendRequest(entity, force);

    return entity.selector$
  }

  public updateEntity(entityName: EntitiesEnum) {
    const entity = this.getEntityObj(entityName);

    this.sendRequest(entity, true);
  }

  private getEntityObj(entityName): IEntityObject<any> {
    const entity = getCacheEntityObj(entityName);
    if (!entity) {
      throw 'Entity: ' + entityName + ' does not exist.';
    }

    return entity;
  }

  private sendRequest(entity, force) {
    if (force || this.shouldRequest(entity)) {
      this.store.dispatch(entity.getGetAction());
      // TODO:
      entity.setRequest('...');
    } else {
      // TODO: update request.
    }
  }

  private shouldRequest(entity: IEntityObject<any>) {
    const data = this.syncSelector.selectSync(entity.selector);
    const shouldRequest = (!data || entity.didTimeExpire());

    return shouldRequest;
  }

}
