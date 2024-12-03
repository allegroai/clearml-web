import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromServing from './serving.reducer';

export const selectServingState = createFeatureSelector<fromServing.State>(
  fromServing.servingFeatureKey,

);
