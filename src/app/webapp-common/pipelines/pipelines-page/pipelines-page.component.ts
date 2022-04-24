import {Component, OnDestroy, OnInit} from '@angular/core';
import { pageSize } from '@common/projects/common-projects.consts';
import {CommonProjectsPageComponent} from '@common/projects/containers/projects-page/common-projects-page.component';
import { isExample } from '@common/shared/utils/shared-utils';
import {trackById} from '@common/shared/utils/forms-track-by';
import {addProjectTags, getProjectsTags, setSelectedProjectId, setTags} from '@common/core/actions/projects.actions';
import {selectProjectTags} from '@common/core/reducers/projects.reducer';
import {Observable} from 'rxjs';
import {Project} from '~/business-logic/model/projects/project';
import { updateProject } from '@common/projects/common-projects.actions';
import {ProjectsGetAllResponseSingle} from '~/business-logic/model/projects/projectsGetAllResponseSingle';

@Component({
  selector: 'sm-pipelines-page',
  templateUrl: './pipelines-page.component.html',
  styleUrls: ['./pipelines-page.component.scss']
})
export class PipelinesPageComponent extends CommonProjectsPageComponent implements OnInit, OnDestroy {
  initPipelineCode = `from clearml import PipelineDecorator

@PipelineDecorator.component(cache=True, execution_queue="default")
def step(size: int):
    import numpy as np
    return np.random.random(size=size)

@PipelineDecorator.pipeline(
    name='ingest',
    project='data processing',
    version='0.1'
)
def pipeline_logic(do_stuff: bool):
    if do_stuff:
        return step(size=42)

if __name__ == '__main__':
    # run the pipeline on the current machine, for local debugging
    # for scale-out, comment-out the following line and spin clearml agents
    PipelineDecorator.run_locally()

    pipeline_logic(do_stuff=True)`;

  pageSize = pageSize;
  isExample = isExample;
  trackById = trackById;
  public projectsTags$: Observable<string[]>;

  ngOnInit() {
    super.ngOnInit();
    this.store.dispatch(getProjectsTags())

    this.projectsTags$ = this.store.select(selectProjectTags);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.store.dispatch(setTags({tags: []}));
  }

  addTag(project: Project, newTag: string) {
    const tags = [...project.tags, newTag];
    this.store.dispatch(updateProject({id: project.id, changes: {tags}}));
    this.store.dispatch(addProjectTags({tags: [newTag], systemTags: []}));
  }

  removeTag(project: Project, deleteTag: string) {
    const tags = project.tags?.filter(tag => tag != deleteTag);
    this.store.dispatch(updateProject({id: project.id, changes: {tags}}));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getExtraProjects(selectedProjectId, selectedProject) {
    return [];
  }

  public projectCardClicked(project: ProjectsGetAllResponseSingle) {
    this.router.navigate( [project.id, 'experiments'], {relativeTo: this.route});
    this.store.dispatch(setSelectedProjectId({projectId: project.id, example: isExample(project)}));
  }

  protected getName() {
    return 'pipelines';
  }
}
