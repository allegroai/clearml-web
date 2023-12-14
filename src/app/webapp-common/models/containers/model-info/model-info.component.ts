import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {selectRouterConfig, selectRouterParams} from '@common/core/reducers/router-reducer';
import {Store} from '@ngrx/store';
import {ModelInfoState} from '../../reducers/model-info.reducer';
import * as infoActions from '../../actions/models-info.actions';
import {selectSelectedModel, selectSelectedTableModel, selectSplitSize} from '../../reducers';
import {SelectedModel} from '../../shared/models.model';
import {selectS3BucketCredentials} from '@common/core/reducers/common-auth-reducer';
import {Observable, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, tap} from 'rxjs/operators';
import {addMessage} from '@common/core/actions/layout.actions';
import {selectBackdropActive} from '@common/core/reducers/view.reducer';
import {setTableMode} from '@common/models/actions/models-view.actions';
import {isReadOnly} from '@common/shared/utils/is-read-only';
import {MESSAGES_SEVERITY} from '@common/constants';
import {toggleSettings} from '@common/experiments/actions/common-experiment-output.actions';
import {Link} from '@common/shared/components/router-tab-nav-bar/router-tab-nav-bar.component';


@Component({
  selector   : 'sm-model-info',
  templateUrl: './model-info.component.html',
  styleUrls  : ['./model-info.component.scss']
})
export class ModelInfoComponent implements OnInit, OnDestroy {

  public selectedModel: SelectedModel;
  private sub = new Subscription();
  private s3BucketCredentials: Observable<any>;
  @ViewChild('modelInfoHeader', { static: true }) modelInfoHeader;
  public selectedModel$: Observable<SelectedModel | null>;
  public isExample: boolean;
  public backdropActive$: Observable<any>;
  private projectId: string;
  public selectedTableModel$: Observable<SelectedModel>;
  public scalars$: Observable<boolean>;
  public splitSize$: Observable<number>;
  links = [
    {name: 'general', url: ['general']},
    {name: 'network', url: ['network']},
    {name: 'labels', url: ['labels']},
    {name: 'metadata', url: ['metadata']},
    {name: 'lineage', url: ['experiments']},
    {name: 'scalars', url: ['scalars']},
    {name: 'plots', url: ['plots']},
  ] as Link[];

  constructor(
    private router: Router,
    private store: Store<ModelInfoState>,
    private route: ActivatedRoute
  ) {
    this.s3BucketCredentials = store.select(selectS3BucketCredentials);
    this.backdropActive$ = this.store.select(selectBackdropActive);
    this.selectedTableModel$ = this.store.select(selectSelectedTableModel);
    this.splitSize$ = this.store.select(selectSplitSize);
  }

  ngOnInit() {
    this.scalars$ = this.store.select(selectRouterConfig)
      .pipe(
        filter(c => !!c),
        distinctUntilChanged(),
        map((config: string[]) => config.includes('scalars'))
      );

    this.sub.add(this.store.select(selectSelectedModel)
      .subscribe(model => {
        this.selectedModel = model;
        this.isExample     = isReadOnly(model);
      })
    );

    this.sub.add(this.store.select(selectRouterParams)
      .pipe(
        tap((params) => {
          this.projectId = params?.projectId;
        }),
        debounceTime(150),
        map(params => params?.modelId),
        filter(modelId => !!modelId),
        distinctUntilChanged()
      )
      .subscribe(id => this.store.dispatch(infoActions.getModelInfo({id})))
    );

    this.selectedModel$ = this.store.select(selectSelectedModel)
      .pipe(filter(model => !!model));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.store.dispatch(infoActions.setModelInfo({model: null}));
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

  toggleSettingsBar() {
    this.store.dispatch(toggleSettings());
  }

  closePanel() {
    this.store.dispatch(setTableMode({mode: 'table'}));
    return this.router.navigate(['..'], {relativeTo: this.route, queryParamsHandling: 'merge'});
  }
}

