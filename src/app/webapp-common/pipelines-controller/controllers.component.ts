import {Component, ViewChild} from '@angular/core';
import {ExperimentsComponent} from '@common/experiments/experiments.component';
import {Store} from '@ngrx/store';
import {ExperimentsViewState} from '~/features/experiments/reducers/experiments-view.reducer';
import {SmSyncStateSelectorService} from '@common/core/services/sync-state-selector.service';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {INITIAL_CONTROLLER_TABLE_COLS} from '@common/pipelines-controller/controllers.consts';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {Observable} from 'rxjs';
import {
  CountAvailableAndIsDisableSelectedFiltered,
  MenuItems,
  selectionDisabledContinue
} from '@common/shared/entity-page/items.utils';
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
import {RefreshService} from '@common/core/services/refresh.service';
import {DeleteFooterItem} from '@common/shared/entity-page/footer-items/delete-footer-item';

@Component({
  selector: 'sm-controllers',
  templateUrl: './controllers.component.html',
  styleUrls: ['./controllers.component.scss']
})
export class ControllersComponent extends ExperimentsComponent {

  @ViewChild('contextMenu') contextMenu: PipelineControllerMenuComponent;
  @ViewChild(SplitComponent) split: SplitComponent;
  @ViewChild(PipelineControllerInfoComponent) diagram: PipelineControllerInfoComponent;

  constructor(protected store: Store<ExperimentsViewState>,
              protected syncSelector: SmSyncStateSelectorService,
              protected route: ActivatedRoute,
              protected router: Router,
              protected dialog: MatDialog,
              protected refresh: RefreshService
  ) {
    super(store, syncSelector, route, router, dialog, refresh);
    this.tableCols = INITIAL_CONTROLLER_TABLE_COLS;
    this.entityType = EntityTypeEnum.controller;
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
      new DeleteFooterItem(),
      new AbortFooterItem(config.entitiesType),
      new DividerFooterItem(),
      new SelectedTagsFooterItem(config.entitiesType),
      new HasReadOnlyFooterItem()
    ];
  }

  onFooterHandler({emitValue, item}, entityType?) {
    switch (item.id) {
      case MenuItems.delete:
        this.contextMenu.deleteExperimentPopup(entityType || EntityTypeEnum.controller, true);
        break;
      case MenuItems.abort:
        this.contextMenu.abortControllerPopup();
        break;
      default:
        super.onFooterHandler({emitValue, item});
    }
  }

  protected getParamId(params) {
    return params?.controllerId;
  }

  newRun() {
    this.contextMenu.runPipelineController(true);
  }

  removeTag({experiment, tag}: {experiment: ISelectedExperiment; tag: string}) {
    this.store.dispatch(removeTag({experiments: [experiment], tag}));
  }

  getSingleSelectedDisableAvailable(experiment) {
    return {
      ...(super.getSingleSelectedDisableAvailable(experiment)),
      [MenuItems.continue]: selectionDisabledContinue([experiment])
    };
  }
}
