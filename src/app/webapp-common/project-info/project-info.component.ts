import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/internal/Observable';
import {Subscription} from 'rxjs';
import {filter, take} from 'rxjs/operators';
import 'ngx-markdown-editor';
import {
  RootProjects,
  selectSelectedMetricVariantForCurrProject,
  selectSelectedProject
} from '../core/reducers/projects.reducer';
import {updateProject} from '../core/actions/projects.actions';
import {Project} from '~/business-logic/model/projects/project';
import {isExample} from '../shared/utils/shared-utils';


@Component({
  selector: 'sm-project-info',
  templateUrl: './project-info.component.html',
  styleUrls: ['./project-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectInfoComponent implements OnInit, OnDestroy {
  private selecteProject$: Observable<Project>;
  private infoSubs: Subscription;
  public info: string;
  public editMode: boolean;
  public loading: boolean;
  public project: Project;
  public panelOpen: boolean = false;
  public example: boolean;
  public isDirty: boolean;
  private projectId: string;

  private selectedVariantSub: Subscription;

  constructor(private store: Store<RootProjects>, private cdr: ChangeDetectorRef) {
    this.selecteProject$ = this.store.select(selectSelectedProject);
    this.loading = true;
  }

  ngOnInit(): void {
    this.infoSubs = this.selecteProject$
      .pipe(
        filter(project => !!project?.id)
      ).subscribe(project => {
        this.project = project;
        this.example = isExample(project);
        this.info = project.description;
        this.projectId = project.id;
        this.loading = false;
        this.cdr.detectChanges();
      });
    this.selectedVariantSub = this.store.select(selectSelectedMetricVariantForCurrProject).pipe(filter(data => !!data), take(1))
      .subscribe(() => {
        this.setMetricsPanel(true);
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy() {
    this.infoSubs.unsubscribe();
    this.selectedVariantSub.unsubscribe();
  }

  setMetricsPanel(open: boolean) {
    this.panelOpen = open;
  }

  saveInfo(info: string) {
    this.store.dispatch(updateProject({id: this.projectId, changes: {description: info}}));
  }
}
