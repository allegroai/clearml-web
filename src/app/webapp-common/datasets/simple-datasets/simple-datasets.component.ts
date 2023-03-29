import {Component, OnInit} from '@angular/core';
import {PipelinesPageComponent} from '@common/pipelines/pipelines-page/pipelines-page.component';
import {ProjectsGetAllResponseSingle} from '~/business-logic/model/projects/projectsGetAllResponseSingle';
import {setDefaultNestedModeForFeature, setSelectedProjectId} from '@common/core/actions/projects.actions';
import {showExampleDatasets} from '../../projects/common-projects.actions';
import {selectShowDatasetExamples} from '../../projects/common-projects.reducer';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {DatasetEmptyComponent} from '@common/datasets/dataset-empty/dataset-empty.component';

@Component({
  selector: 'sm-simple-datasets',
  templateUrl: './simple-datasets.component.html',
  styleUrls: ['./simple-datasets.component.scss']
})
export class SimpleDatasetsComponent extends PipelinesPageComponent implements OnInit {

  public projectCardClicked(project: ProjectsGetAllResponseSingle) {
    this.router.navigate(['simple', project.id, 'experiments'], {relativeTo: this.projectId? this.route.parent.parent: this.route});
    this.store.dispatch(setSelectedProjectId({projectId: project.id, example: this.isExample(project)}));
  }

  protected getName() {
    return EntityTypeEnum.simpleDataset;
  }

  protected getDeletePopupEntitiesList() {
    return 'version';
  }

  createDataset() {
    this.dialog.open(DatasetEmptyComponent, {
      maxWidth: '95vw',
      width: '1248px'
    });
  }

  public createExamples() {
    this.store.dispatch(showExampleDatasets());
  }
  ngOnInit() {
    super.ngOnInit();
    this.showExamples$ = this.store.select(selectShowDatasetExamples);
  }
  toggleNestedView(nested: boolean) {
    this.store.dispatch(setDefaultNestedModeForFeature({feature: 'datasets', isNested: nested}));

    if (nested) {
      this.router.navigate(['simple', '*', 'projects'], {relativeTo: this.route});
    } else {
      this.router.navigateByUrl('datasets');
    }
  }
}
