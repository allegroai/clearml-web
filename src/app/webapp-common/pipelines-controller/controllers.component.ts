import {Component, OnDestroy, ViewChild} from '@angular/core';
import {ExperimentsComponent} from '@common/experiments/experiments.component';
import {Store} from '@ngrx/store';
import {IExperimentsViewState} from '~/features/experiments/reducers/experiments-view.reducer';
import {SmSyncStateSelectorService} from '@common/core/services/sync-state-selector.service';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {INITIAL_CONTROLLER_TABLE_COLS} from '@common/pipelines-controller/controllers.consts';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {Observable, Subscription} from 'rxjs';
import {CountAvailableAndIsDisableSelectedFiltered, MenuItems} from '@common/shared/entity-page/items.utils';
import {ShowItemsFooterSelected} from '@common/shared/entity-page/footer-items/show-items-footer-selected';
import {CompareFooterItem} from '@common/shared/entity-page/footer-items/compare-footer-item';
import {DividerFooterItem} from '@common/shared/entity-page/footer-items/divider-footer-item';
import {ArchiveFooterItem} from '@common/shared/entity-page/footer-items/archive-footer-item';
import {SelectedTagsFooterItem} from '@common/shared/entity-page/footer-items/selected-tags-footer-item';
import {HasReadOnlyFooterItem} from '@common/shared/entity-page/footer-items/has-read-only-footer-item';
import {PipelineControllerMenuComponent} from '@common/pipelines-controller/pipeline-controller-menu/pipeline-controller-menu.component';
import {SplitComponent} from 'angular-split';
import {PipelineControllerInfoComponent} from '@common/pipelines-controller/pipeline-controller-info/pipeline-controller-info.component';
import {AbortFooterItem} from '@common/shared/entity-page/footer-items/abort-footer-item';
import { removeTag } from '@common/experiments/actions/common-experiments-menu.actions';
import {ISelectedExperiment} from '~/features/experiments/shared/experiment-info.model';

@Component({
  selector: 'sm-controllers',
  templateUrl: './controllers.component.html',
  styleUrls: ['./controllers.component.scss']
})
export class ControllersComponent extends ExperimentsComponent implements OnDestroy {

  @ViewChild('contextMenu') contextMenu: PipelineControllerMenuComponent;
  @ViewChild(SplitComponent) split: SplitComponent;
  @ViewChild(PipelineControllerInfoComponent) diagram: PipelineControllerInfoComponent;
  private sub = new Subscription();

  constructor(protected store: Store<IExperimentsViewState>,
              protected syncSelector: SmSyncStateSelectorService,
              protected route: ActivatedRoute,
              protected router: Router,
              protected dialog: MatDialog) {
    super(store, syncSelector, route, router, dialog);
    this.tableCols = INITIAL_CONTROLLER_TABLE_COLS;
    this.entityType = EntityTypeEnum.controller;
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.sub.unsubscribe();
  }

  createFooterItems(config: {
    entitiesType: EntityTypeEnum;
    selected$: Observable<Array<any>>;
    showAllSelectedIsActive$: Observable<boolean>;
    tags$: Observable<string[]>;
    data$?: Observable<Record<string, CountAvailableAndIsDisableSelectedFiltered>>;
    companyTags$: Observable<string[]>;
    projectTags$: Observable<string[]>;
    tagsFilterByProject$: Observable<boolean>;
  }) {
    super.createFooterItems(config);
    this.footerItems = [
      new ShowItemsFooterSelected(config.entitiesType),
      new CompareFooterItem(config.entitiesType),
      new DividerFooterItem(),
      new ArchiveFooterItem(config.entitiesType),
      new AbortFooterItem(config.entitiesType),
      new DividerFooterItem(),

      new SelectedTagsFooterItem(config.entitiesType),
      new HasReadOnlyFooterItem()
    ];
  }

  onFooterHandler({emitValue, item}) {
    switch (item.id) {
      case MenuItems.showAllItems:
        this.showAllSelected(!emitValue);
        break;
      case MenuItems.compare:
        this.compareExperiments();
        break;
      case MenuItems.archive:
        this.contextMenu.restoreArchive();
        break;
      case MenuItems.enqueue:
        this.contextMenu.enqueuePopup();
        break;
      case MenuItems.dequeue:
        this.contextMenu.dequeuePopup();
        break;
      case MenuItems.delete:
        this.contextMenu.deleteExperimentPopup(EntityTypeEnum.controller, true);
        break;
      case MenuItems.abort:
        this.contextMenu.abortControllerPopup();
        break;
    }
  }

  protected getParamId(params) {
    return params?.controllerId;
  }

  newRun() {
    this.contextMenu.runPipelineController(true)
  }

  onContextMenuOpen(position: { x: number; y: number }) {
    this.contextMenu?.openMenu(position);
  }

  removeTag({experiment, tag}: {experiment: ISelectedExperiment; tag: string}) {
    this.store.dispatch(removeTag({experiments: [experiment], tag}));
  }
}
