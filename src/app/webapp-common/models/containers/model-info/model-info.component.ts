import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {selectRouterParams} from '../../../core/reducers/router-reducer';
import {Store} from '@ngrx/store';
import {ModelInfoState} from '../../reducers/model-info.reducer';
import {get} from 'lodash/fp';
import * as infoActions from '../../actions/models-info.actions';
import {selectSelectedModel, selectSelectedTableModel} from '../../reducers';
import {SelectedModel} from '../../shared/models.model';
import {AdminService} from '~/shared/services/admin.service';
import {selectS3BucketCredentials} from '../../../core/reducers/common-auth-reducer';
import {SmSyncStateSelectorService} from '../../../core/services/sync-state-selector.service';
import {Observable, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, tap} from 'rxjs/operators';
import {addMessage} from '../../../core/actions/layout.actions';
import {MESSAGES_SEVERITY} from '../../../../app.constants';
import {isReadOnly} from '../../../shared/utils/shared-utils';
import {selectBackdropActive} from '../../../core/reducers/view.reducer';


@Component({
  selector   : 'sm-model-info',
  templateUrl: './model-info.component.html',
  styleUrls  : ['./model-info.component.scss']
})
export class ModelInfoComponent implements OnInit, OnDestroy {

  private paramsSubscription: Subscription;
  public selectedModel: SelectedModel;
  private selectedModelSubscription: Subscription;
  private S3BucketCredentials: Observable<any>;
  @ViewChild('modelInfoHeader', { static: true }) modelInfoHeader;
  public selectedModel$: Observable<SelectedModel | null>;
  public isExample: boolean;
  public backdropActive$: Observable<any>;
  private projectId: string;
  public selectedTableModel$: Observable<SelectedModel>;

  constructor(private router: Router, private store: Store<ModelInfoState>, private route: ActivatedRoute, private adminService: AdminService, private syncSelector: SmSyncStateSelectorService) {
    this.S3BucketCredentials = store.select(selectS3BucketCredentials);
    this.backdropActive$ = this.store.select(selectBackdropActive);
    this.selectedTableModel$ = this.store.select(selectSelectedTableModel);
  }

  ngOnInit() {
    this.selectedModelSubscription = this.store.select(selectSelectedModel)
      .subscribe(model => {
        this.selectedModel = model;
        this.isExample     = isReadOnly(model);
      });
    this.paramsSubscription = this.store.select(selectRouterParams)
      .pipe(
        tap((params) => {
          this.projectId = get('projectId', params);
        }),
        debounceTime(150),
        map(params => get('modelId', params)),
        filter(modelId => !!modelId),
        distinctUntilChanged()
      )
      .subscribe(modelId => this.store.dispatch(new infoActions.GetModelInfo(modelId)));
    this.selectedModel$            = this.store.select(selectSelectedModel).pipe(filter(model => !!model));
  }

  ngOnDestroy(): void {
    this.paramsSubscription.unsubscribe();
    this.selectedModelSubscription.unsubscribe();
    this.store.dispatch(new infoActions.SetModel(null));
  }

  public updateModelName(name) {
    if (name.trim().length > 2) {
      this.store.dispatch(infoActions.updateModelDetails({id: this.selectedModel.id, changes: {name}}));
    } else {
      this.store.dispatch(addMessage(MESSAGES_SEVERITY.ERROR, 'Name must be more than three letters long'));
    }
  }

  public getReadyStatus(ready) {
    if (ready === null) {
      return null;
    }
    return ready ? 'published' : 'created';
  }

  deselectModel() {
    return this.navigateAfterModelSelectionChanged();
  }

  navigateAfterModelSelectionChanged() {
    return this.router.navigate([`projects/${this.projectId}/models`], {queryParamsHandling: 'preserve'});
  }
}

