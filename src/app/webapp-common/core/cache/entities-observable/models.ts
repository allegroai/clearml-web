// import {Observable, Observer} from 'rxjs';
// import {selectModelsData} from '../../reducers/models-reducer';
// import {IEntityObject} from '../models';
// import {GetNextModels} from '../../../features/../webapp-common/models/actions/models-view.actions';
// import {Model} from '../../../business-logic/models/models/models';
//
// export class ModelsEntity implements IEntityObject<Array<Partial<Model>>> {
//
//   // 2 minutes.
//   expirationTime = 2 * 60000;
//   // 10 minutes.
//   pingingTime = 10 * 60000;
//   _observer: Observer<{instance: IEntityObject<Array<Partial<Model>>>, force: boolean}>;
//   _store: any;
//   _getAction = GetNextModels;
//   selector = selectModelsData;
//   _updateAction: any;
//   stream$: Observable<{instance: IEntityObject<Array<Partial<Model>>>, force: boolean}>;
//   selector$: Observable<Array<Partial<Model>>>;
//   lastRequest: any;
//   lastRequestTime: number;
//   _isActive: boolean;
//   _interval: NodeJS.Timer;
//   _pingCounter = 0;
//
//   public init(store): void {
//     this._store = store;
//     this.selector$ = this._store.select(this.selector);
//     this.stream$ = Observable.create(observer => {
//       this._observer = observer;
//     });
//   }
//
//   public startPinging(force = false): void {
//     if (!this._observer || this._pingCounter > 0) return;
//     this._pingCounter++;
//     this._observer.next({instance: this, force});
//     this._isActive = true;
//     this._interval = setInterval(() => {
//       this._observer.next({instance: this, force});
//       this.setRequest('...');
//     }, this.pingingTime);
//   }
//
//   public stopPinging() {
//     if (!this._observer || this._pingCounter === 0) return;
//     this._pingCounter--;
//     this._isActive = true;
//     console.log('stop interval');
//     clearInterval(this._interval);
//   }
//
//   public isActive() {
//     return this._isActive;
//   }
//
//   public setRequest(request: any): void {
//     this.lastRequest = request;
//     this.lastRequestTime = Date.now();
//   }
//
//   public didTimeExpire(): boolean {
//     return Date.now() > this.lastRequestTime + this.expirationTime;
//   }
//
//   public getGetAction() {
//     return new this._getAction();
//   }
// }
//
// const modelsEntity = new ModelsEntity();
// export {modelsEntity};
