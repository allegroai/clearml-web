import {Component, Input} from '@angular/core';
import {ExperimentSharedModule} from '~/features/experiments/shared/experiment-shared.module';
import {DebugImagesModule} from '@common/debug-images/debug-images.module';
import {NgIf} from '@angular/common';

@Component({
  selector: 'sm-simple-dataset-version-preview',
  templateUrl: './simple-dataset-version-preview.component.html',
  styleUrls: ['./simple-dataset-version-preview.component.scss'],
  imports: [
    ExperimentSharedModule,
    DebugImagesModule,
    NgIf
  ],
  standalone: true
})
export class SimpleDatasetVersionPreviewComponent {
  @Input() selected;
}
