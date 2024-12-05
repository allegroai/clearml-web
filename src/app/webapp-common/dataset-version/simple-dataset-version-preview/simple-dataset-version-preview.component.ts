import {ChangeDetectionStrategy, Component, input } from '@angular/core';
import {DebugImagesModule} from '@common/debug-images/debug-images.module';
import {ExperimentSharedModule} from '~/features/experiments/shared/experiment-shared.module';

@Component({
  selector: 'sm-simple-dataset-version-preview',
  templateUrl: './simple-dataset-version-preview.component.html',
  styleUrls: ['./simple-dataset-version-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ExperimentSharedModule,
    DebugImagesModule
],
  standalone: true
})
export class SimpleDatasetVersionPreviewComponent {
  selected = input.required<{id: string}>();
}
