import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SMSharedModule} from '../shared/shared.module';
import {CommonSearchComponent} from './containers/common-search/common-search.component';
import {StoreModule} from '@ngrx/store';
import {searchReducer} from './common-search.reducer';

@NgModule({
  imports     : [
    CommonModule,
    SMSharedModule,
    StoreModule.forFeature('commonSearch', searchReducer),
  ],
  declarations: [CommonSearchComponent],
  exports     : [CommonSearchComponent]
})
export class CommonSearchModule {
}
