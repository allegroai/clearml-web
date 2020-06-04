import {Observable} from 'rxjs';
import {EntitiesEnum} from '../../../business-logic/constants';
import {getCacheEntityObj} from './get-entity';

export function Entity(entity: EntitiesEnum, force = false) {

  const entityObj = getCacheEntityObj(entity);

  return function(target, key) {
    if (entityObj) {
      const _onInit = target.ngOnInit;
      const _onDestroy = target.ngOnDestroy;

      target.ngOnInit = function() {
        entityObj.startPinging(force);
        target[key] = getEntitySelector(entityObj);

        if (_onInit) {
          // TODO: call pass the object not the instance, find better solution
          return _onInit.call(target);
        }
      };

      target.ngOnDestroy = function() {
        entityObj.stopPinging();
        if (_onDestroy) {
          // TODO: call pass the object not the instance, find better solution
          return _onDestroy.call(target);
        }

      };

    }
  };
}

function getEntitySelector(entityObj): Observable<any[]> {
  return entityObj.selector$;
}
