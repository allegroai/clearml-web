import {Component, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {ModelInfoState} from '../../reducers/model-info.reducer';
import {Store} from '@ngrx/store';
import {SelectedModel} from '../../shared/models.model';
import {selectSelectedModel} from '../../reducers';
import {filter} from 'rxjs/operators';
import {resetDontShowAgainForBucketEndpoint} from '../../../core/actions/common-auth.actions';
import {createModelLink, isReadOnly} from '../../../shared/utils/shared-utils';
import {AdminService} from '../../../../features/admin/admin.service';
import {ModelDetailsUpdated, updateModelDetails} from '../../actions/models-info.actions';

@Component({
  selector: 'sm-model-info-general',
  templateUrl: './model-info-general.component.html',
})
export class ModelInfoGeneralComponent implements OnDestroy {

  public selectedModel: SelectedModel;
  public isExample: boolean;
  private selectedModelSubscription: Subscription;

  constructor(private store: Store<ModelInfoState>, private adminService: AdminService) {
    this.selectedModelSubscription = this.store.select(selectSelectedModel).pipe(
      filter(model => !!model))
      .subscribe(model => {
        this.isExample     = isReadOnly(model);
        this.selectedModel = model;
      });
  }

  showModel(model) {
    this.store.dispatch(resetDontShowAgainForBucketEndpoint());
    const modelSignedUri = this.adminService.signUrlIfNeeded(model.uri);
    if (modelSignedUri) {
      window.open(createModelLink(model.uri, model.id, modelSignedUri));
    }
  }

  commentChanged(comment) {
    this.store.dispatch(updateModelDetails({id: this.selectedModel.id, changes: {comment: comment}}));
  }

  ngOnDestroy(): void {
    this.selectedModelSubscription.unsubscribe();
  }

}
