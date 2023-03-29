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
import {datasetLabel, EntityTypePluralEnum, getDatasetUrlPrefix, getEntityTypeFromUrlConf, getNestedEntityBaseUrl, getNestedEntityName, isDatasetType} from '~/features/nested-project-view/nested-project-view-utils';


@Component({
  selector: 'sm-nested-project-view-page',
  templateUrl: './nested-project-view-page.component.html',
  styleUrls: ['./nested-project-view-page.component.scss']
})
export class NestedProjectViewPageComponent extends SimpleDatasetsComponent implements OnInit, OnDestroy {
  hideMenu = false;
  entityType: string = 'pipelines';
  entityTypeEnum = EntityTypePluralEnum;
  circleTypeEnum = CircleTypeEnum;
  private routeConfigSub: Subscription;
  isDatasetType = isDatasetType;
  datasetLabel= datasetLabel;

  ngOnInit() {
    super.ngOnInit();
    this.routeConfigSub = this.store.select(selectRouterConfig).subscribe(conf => {
      this.entityType = getEntityTypeFromUrlConf(conf);
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
    const relevantSubProjects = cardProject?.id === project?.id ? project.sub_projects : cardProject?.sub_projects.filter(pr => pr.name.startsWith(project.name + '/'));
    if ((relevantSubProjects ?? []).filter((subProject) => (!subProject.name.slice(project.name.length).startsWith(`/.${this.entityType}`))).length === 0) {
      this.router.navigate([(this.entityType === this.entityTypeEnum.pipelines || this.entityType === this.entityTypeEnum.reports) ?
          project.id : `${getDatasetUrlPrefix(this.entityType)}/${project.id}` , this.entityType],
        {relativeTo: (this.entityType === this.entityTypeEnum.pipelines) ? this.route.parent?.parent?.parent : this.route.parent?.parent});
    } else {
      this.router.navigate([(this.entityType === this.entityTypeEnum.pipelines || this.entityType === this.entityTypeEnum.reports) ? project.id : `${getDatasetUrlPrefix(this.entityType)}/${project.id}`, 'projects'], {relativeTo: (this.entityType === this.entityTypeEnum.pipelines) ? this.route.parent?.parent?.parent : this.route.parent?.parent});
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
    this.dialog.open(ReportDialogComponent).afterClosed().subscribe(report => {
      if (report) {
        this.store.dispatch(createReport({reportsCreateRequest: report}));
      }
    });
  }


}
