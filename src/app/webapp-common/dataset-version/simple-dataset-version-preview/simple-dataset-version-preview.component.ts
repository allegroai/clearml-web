import {Component, Input} from '@angular/core';

@Component({
  selector: 'sm-simple-dataset-version-preview',
  templateUrl: './simple-dataset-version-preview.component.html',
  styleUrls: ['./simple-dataset-version-preview.component.scss']
})
export class SimpleDatasetVersionPreviewComponent {
  @Input() selected;
}
