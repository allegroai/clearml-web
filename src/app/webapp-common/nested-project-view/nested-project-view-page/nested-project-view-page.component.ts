import {Component, OnDestroy, OnInit} from '@angular/core';
import {Project} from '~/business-logic/model/projects/project';
import {CircleTypeEnum} from '~/shared/constants/non-common-consts';
import {selectRouterConfig} from '@common/core/reducers/router-reducer';
import {SimpleDatasetsComponent} from '@common/datasets/simple-datasets/simple-datasets.component';
import {setDefaultNestedModeForFeature} from '@common/core/actions/projects.actions';
import {Subscription} from 'rxjs';
import {showExampleDatasets, showExamplePipelines} from '@common/projects/common-projects.actions';
import {ReportDialogComponent} from '@common/reports/report-dialog/report-dialog.component';
import {createReport} from '@common/reports/reports.actions';
import {
  datasetLabel,
  EntityTypePluralEnum,
  getDatasetUrlPrefix,
  getEntityTypeFromUrlConf,
  getNestedEntityBaseUrl,
  getNestedEntityName,
  isDatasetType
} from '~/features/nested-project-view/nested-project-view-utils';


@Component({
  selector: 'sm-nested-project-view-page',
  templateUrl: './nested-project-view-page.component.html',
  styleUrls: ['./nested-project-view-page.component.scss']
})
export class NestedProjectViewPageComponent extends SimpleDatasetsComponent implements OnInit, OnDestroy {
  hideMenu = false;
  entityType = 'pipelines' as EntityTypePluralEnum;
  entityTypeEnum = EntityTypePluralEnum;
  circleTypeEnum = CircleTypeEnum;
  isDatasetType = isDatasetType;
  datasetLabel= datasetLabel;
  private routeConfigSub: Subscription;
  totalVirtualCards = 0;

  ngOnInit() {
    super.ngOnInit();
    this.routeConfigSub = this.store.select(selectRouterConfig)
      .subscribe(conf => {
        this.entityType = getEntityTypeFromUrlConf(conf);
        if (this.entityType === EntityTypePluralEnum.reports) {
          this.totalVirtualCards = 1;
        }
        this.syncAppSearch();
        this.store.dispatch(setDefaultNestedModeForFeature({feature: this.entityType, isNested: true}));
      });
  }

  getName() {
    return getNestedEntityName(this.entityType);
  };

  ngOnDestroy() {
    super.ngOnDestroy();
    this.routeConfigSub.unsubscribe();
  }

  nestedProjectCardClicked(project: Project, cardProject) {
    const simpleUrl = [this.entityTypeEnum.pipelines, this.entityTypeEnum.reports].includes(this.entityType);
    const relevantSubProjects = cardProject?.id === project?.id ? project.sub_projects : cardProject?.sub_projects.filter(pr => pr.name.startsWith(project.name + '/'));
    const parent = (this.entityType === this.entityTypeEnum.pipelines) ? this.route.parent?.parent?.parent : this.route.parent?.parent;
    if ((project as any).isRoot && project.id === '*') {
      return this.router.navigate(['*', 'reports'], {relativeTo: parent});
    }
    if ((relevantSubProjects ?? []).filter((subProject) => (!subProject.name.slice(project.name.length).startsWith(`/.${this.entityType}`))).length === 0) {
      return this.router.navigate([
          ...(simpleUrl ? [project.id] : [getDatasetUrlPrefix(this.entityType), project.id]),
          this.entityType
        ],
        {relativeTo: parent}
      );
    } else {
      return this.router.navigate(simpleUrl ? [project.id, 'projects'] : [getDatasetUrlPrefix(this.entityType), project.id, 'projects'],
        {relativeTo: parent}
      );
    }
  }

  toggleNestedView(nested: boolean) {
    this.store.dispatch(setDefaultNestedModeForFeature({feature: this.entityType, isNested: nested}));
    if (!nested) {
      this.router.navigateByUrl(getNestedEntityBaseUrl(this.entityType));
    }
  }

  createPipelineExamples() {
    this.store.dispatch(showExamplePipelines());
  }

  createDatasetExamples() {
    this.store.dispatch(showExampleDatasets());
  }



  public openCreateReportDialog() {
    this.dialog.open(ReportDialogComponent, {panelClass: 'light-theme', data: {defaultProjectId: this.projectId}})
      .afterClosed()
      .subscribe(report => {
        if (report) {
          this.store.dispatch(createReport({reportsCreateRequest: report}));
        }
    });
  }


}
