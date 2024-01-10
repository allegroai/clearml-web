import {Component} from '@angular/core';
import {PipelinesPageComponent} from '@common/pipelines/pipelines-page/pipelines-page.component';
import {ProjectTypeEnum} from '@common/nested-project-view/nested-project-view-page/nested-project-view-page.component';
import {CircleTypeEnum} from '~/shared/constants/non-common-consts';
import {showExamplePipelines} from '@common/projects/common-projects.actions';
import {ProjectsSharedModule} from '~/features/projects/shared/projects-shared.module';
import {AsyncPipe, NgIf} from '@angular/common';
import {setDefaultNestedModeForFeature} from '@common/core/actions/projects.actions';
import {CircleCounterComponent} from '@common/shared/ui-components/indicators/circle-counter/circle-counter.component';
import {TagListComponent} from '@common/shared/ui-components/tags/tag-list/tag-list.component';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';

@Component({
  selector: 'sm-nested-pipeline-page',
  templateUrl: './nested-pipeline-page.component.html',
  styleUrls: ['../../nested-project-view/nested-project-view-page/nested-project-view-page.component.scss'],
  imports: [
    ProjectsSharedModule,
    AsyncPipe,
    NgIf,
    CircleCounterComponent,
    TagListComponent,
    ClickStopPropagationDirective
  ],
  standalone: true
})
export class NestedPipelinePageComponent extends PipelinesPageComponent {
  entityTypeEnum = ProjectTypeEnum;
  circleTypeEnum = CircleTypeEnum;
  hideMenu = false;

  constructor() {
    super();
    this.entityType = ProjectTypeEnum.pipelines;
  }

  override projectCardClicked(data: { hasSubProjects: boolean; id: string; name: string }) {
    if (data.hasSubProjects) {
      this.router.navigate([data.id, 'projects'], {relativeTo: this.route.parent?.parent});
    } else {
      this.router.navigate([data.id, this.entityType], {relativeTo: this.route.parent?.parent});
    }
  }

  createPipelineExamples() {
    this.store.dispatch(showExamplePipelines());
  }

  override toggleNestedView(nested: boolean) {
    this.store.dispatch(setDefaultNestedModeForFeature({feature: this.entityType, isNested: nested}));
    if (!nested) {
      this.router.navigateByUrl(this.entityType);
    }
  }
}
