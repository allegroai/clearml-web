import {EntitiesEnum} from '../../../business-logic/constants';
// import {modelsEntity} from './entities-observable/models';
import {IEntityObject} from './model';

export function getCacheEntityObj(entity: EntitiesEnum): IEntityObject<any> | false {

  switch (entity) {
    // case 'models':
    //   return modelsEntity;
    default:
      return false;
  }
}
