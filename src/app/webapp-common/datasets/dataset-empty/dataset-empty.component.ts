import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';

@Component({
  selector: 'sm-dataset-empty',
  templateUrl: './dataset-empty.component.html',
  styleUrls: ['./dataset-empty.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasetEmptyComponent {
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
  @Input() showButton;
  emptyStateTab= 'cli';
  showCode = false;
  constructor(private cdr: ChangeDetectorRef) {
    window.setTimeout(()=> {
      this.showCode = true;
      this.cdr.detectChanges();
    }, 300);
  }
  emptyStateTabClicked(codeTab: string) {
    this.emptyStateTab = codeTab;
  }

}
