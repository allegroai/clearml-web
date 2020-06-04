import {Store, Action} from '@ngrx/store';
import {Observable} from 'rxjs';
import {filter, take} from 'rxjs/operators';
import {Project} from '../../../business-logic/model/projects/project';
import {isExample} from '../utils/shared-utils';
import {selectSelectedProject} from '../../core/reducers/projects.reducer';
import {selectSplitSize} from '../../experiments/reducers';
import {setSplitSize} from '../../experiments/actions/common-experiments-view.actions';
import {IOutputData} from 'angular-split/lib/interface';

export class BaseEntityPage {
  protected preventUrlUpdate = false;
  public projectId: string;
  protected selectedProject$: Observable<Project>;

  public isExampleProject: boolean;
  public selectSplitSize$: Observable<number>;
  public infoDisabled: boolean;

  constructor(protected store: Store<any>) {
    this.selectedProject$ = this.store.select(selectSelectedProject);
    this.selectSplitSize$ = this.store.select(selectSplitSize);
    this.selectedProject$.pipe(filter(p => !!p), take(1)).subscribe((project: Project) => {
      this.isExampleProject = isExample(project);
    });
  }

  dispatchAndLock(action: Action) {
    this.preventUrlUpdate = true;
    this.store.dispatch(action);
  }

  splitSizeChange($event: IOutputData) {
    this.store.dispatch(setSplitSize({splitSize: $event.sizes[1] as number}));
    this.infoDisabled = false;
  }
}
