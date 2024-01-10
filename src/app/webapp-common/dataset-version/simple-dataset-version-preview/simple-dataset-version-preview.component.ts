import {NgIf} from '@angular/common';
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {DebugImagesModule} from '@common/debug-images/debug-images.module';
import {ExperimentSharedModule} from '~/features/experiments/shared/experiment-shared.module';

@Component({
  selector: 'sm-simple-dataset-version-preview',
  templateUrl: './simple-dataset-version-preview.component.html',
  styleUrls: ['./simple-dataset-version-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ExperimentSharedModule,
    DebugImagesModule,
    NgIf
  ],
  standalone: true
})
export class SimpleDatasetVersionPreviewComponent {
  @Input() selected: {id: string};
}
