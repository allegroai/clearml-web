import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {PipelinesPageComponent} from '@common/pipelines/pipelines-page/pipelines-page.component';
import {ProjectsGetAllResponseSingle} from '~/business-logic/model/projects/projectsGetAllResponseSingle';
import {setSelectedProjectId} from '@common/core/actions/projects.actions';
import {ConfirmDialogComponent} from '../../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {showExampleDatasets} from '../../projects/common-projects.actions';
import {selectShowDatasetExamples} from '../../projects/common-projects.reducer';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';

@Component({
  selector: 'sm-simple-datasets',
  templateUrl: './simple-datasets.component.html',
  styleUrls: ['./simple-datasets.component.scss']
})
export class SimpleDatasetsComponent extends PipelinesPageComponent implements OnInit {
  @ViewChild('datasetEmptyStateContent') datasetEmptyStateRef: TemplateRef<any>;

  initDatasetCLICode = `curl -o Affairs.csv https://vincentarelbundock.github.io/Rdatasets/csv/AER/Affairs.csv

clearml-data create --project DatasetProject --name HelloDataset

clearml-data add --files Affairs.csv

clearml-data close`;

  initDatasetSDKCode = `# create example dataset
from clearml import StorageManager, Dataset

# Download sample csv file
csv_file = StorageManager.get_local_copy(
    remote_url="https://vincentarelbundock.github.io/Rdatasets/csv/AER/Affairs.csv"
)

# Create a dataset with ClearML\`s Dataset class
dataset = Dataset.create(
    dataset_project="DatasetProject", dataset_name="HelloDataset"
)

# add the example csv
dataset.add_files(path=csv_file)

# Upload dataset to ClearML server (customizable)
dataset.upload()

# commit dataset changes
dataset.finalize()`;
  public emptyStateTab: string = 'cli';

  public projectCardClicked(project: ProjectsGetAllResponseSingle) {
    this.router.navigate(['simple', project.id, 'experiments'], {relativeTo: this.route});
    this.store.dispatch(setSelectedProjectId({projectId: project.id, example: this.isExample(project)}));
  }

  protected getName() {
    return EntityTypeEnum.simpleDataset;
  }

  protected getDeletePopupEntitiesList() {
    return 'version';
  }

  createDataset() {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'CREATE NEW DATASET',
        template: this.datasetEmptyStateRef,
        iconClass: 'al-icon al-ico-datasets al-color blue-300',
        width: 1200
      },
      maxWidth: '95vw'
    });
  }

  emptyStateTabClicked(codeTab: string) {
    this.emptyStateTab = codeTab;
  }
  createExamples() {
    this.store.dispatch(showExampleDatasets());
  }
  ngOnInit() {
    super.ngOnInit();
    this.showExamples$ = this.store.select(selectShowDatasetExamples);

  }
}
