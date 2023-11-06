import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Project} from '~/business-logic/model/projects/project';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {NgForm} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {selectTablesFilterProjectsOptions} from '@common/core/reducers/projects.reducer';
import {getTablesFilterProjectsOptions, resetTablesFilterProjectsOptions} from '@common/core/actions/projects.actions';
import {filter, map, tap} from 'rxjs/operators';
import {CloneForm} from '../../common-experiment-model.model';
import {isEqual} from 'lodash-es';
import {isReadOnly} from '@common/shared/utils/is-read-only';
import {rootProjectsPageSize} from '@common/constants';
import {ProjectsGetAllResponseSingle} from '~/business-logic/model/projects/projectsGetAllResponseSingle';

@Component({
  selector: 'sm-clone-dialog',
  templateUrl: './clone-dialog.component.html',
  styleUrls: ['./clone-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CloneDialogComponent implements OnInit, OnDestroy {

  public reference: string;
  public header: string;
  public type: string;
  public projects$: Observable<Project[]>;
  public formData = {
    project: null,
    name: null,
    comment: null
  } as CloneForm;
  public projects: { label: string; value: string }[];

  private readonly defaultProjectId: string;
  private subs = new Subscription();
  private readonly cloneNamePrefix: string;

  @ViewChild('cloneForm', {static: true}) cloneForm: NgForm;
  @ViewChild('cloneButton', {static: true}) cloneButton: ElementRef;
  public filteredProjects: Observable<{ label: string; value: string }[]>;
  isAutoCompleteOpen: boolean;
  public readOnlyProjects$: Observable<string[]>;
  public extend: boolean;
  public projectsNames: string[];
  public loading: boolean;
  public noMoreOptions: boolean;
  private previousLength: number | undefined;
  private allProjectsBeforeFilter: Partial<ProjectsGetAllResponseSingle>[];

  constructor(
    private store: Store,
    public dialogRef: MatDialogRef<CloneDialogComponent>,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) data: {
      type: string;
      defaultProject: string;
      defaultName: string;
      defaultComment: string;
      extend: boolean;
    },
  ) {
    this.defaultProjectId = data.defaultProject;
    this.header = `${data.extend ? 'Extend' : 'Clone'} ${data.type}`;
    this.cloneNamePrefix = data.extend ? '' : 'Clone Of ';
    this.type = data.type.toLowerCase();
    this.reference = data.defaultName;
    this.extend = data.extend;
    this.formData.name = this.cloneNamePrefix;
    setTimeout(() => {
      this.formData = {
        ...this.formData,
        name: this.extend ? '' : this.cloneNamePrefix + data.defaultName,
        comment: data.defaultComment || '',
      };
    });

    this.readOnlyProjects$ = this.store.select(selectTablesFilterProjectsOptions)
      .pipe(map(projects => projects?.filter(project => isReadOnly(project)).map(project => project.name)));
    this.projects$ = this.store.select(selectTablesFilterProjectsOptions).pipe(
      tap(projects => this.allProjectsBeforeFilter = projects),
      filter(projects => !!projects),
      map(projects => projects?.filter(project => !isReadOnly(project))));
  }


  searchChanged(searchString: {value: string; loadMore?: boolean}) {
    this.projects = null;
    // this.rootFiltered = !this.projectRoot.includes(searchString);
    !searchString.loadMore && this.store.dispatch(resetTablesFilterProjectsOptions());
    this.store.dispatch(getTablesFilterProjectsOptions({searchString: searchString.value, loadMore: searchString.loadMore}));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnInit(): void {
    this.searchChanged({value: this.defaultProjectId ? this.defaultProjectId : ''});
    this.subs.add(this.projects$.subscribe(projects => {
      this.loading = false;
      this.noMoreOptions = this.allProjectsBeforeFilter?.length === this.previousLength || this.allProjectsBeforeFilter?.length < rootProjectsPageSize;
      this.previousLength = this.allProjectsBeforeFilter?.length;
      const projectList = [
        // ...(this.rootFiltered ? [] : [{value: null, label: this.projectRoot}]),
        ...projects.map(project => ({value: project.id, label: project.name}))
      ];
      if (!isEqual(projectList, this.projects)) {
        this.projects = projectList;
        this.projectsNames = projectList.map(p => p.label);
        const defaultProjectIndex = this.projects.findIndex(project => project.value === this.defaultProjectId);
        // setTimeout(() => {
          if (this.formData.project === null) {
            this.formData.project = (defaultProjectIndex > -1 && projects[defaultProjectIndex].company?.id) ? this.projects[defaultProjectIndex] : projects[0] ? this.projects[0] : null;
            // this.cdr.detectChanges();
          }
        // }, 0);
      }
    }));
    setTimeout(() => {
      if (!this.cloneForm?.controls['projectName']) {
        return;
      }
      this.subs.add(this.cloneForm.controls['projectName'].valueChanges
        .subscribe(searchString => {
            if (typeof searchString === 'string') {
              this.searchChanged({value: searchString || ''});
              this.previousLength = 0;
            }
          }
        ));
    }, 1000);

  }

  displayFn(project: any ): string {
    return project && project.label ? project.label : project ;
  }

  closeDialog(isConfirmed) {
    if (isConfirmed) {
      if (typeof this.formData.project === 'string') {
        this.formData.project = {label: this.formData.project, value: ''};
      }
      this.dialogRef.close(this.formData);
    } else {
      this.dialogRef.close(null);
    }
  }

  clear() {
    this.formData.project = '';
  }

  setIsAutoCompleteOpen(focus: boolean) {
    this.isAutoCompleteOpen = focus;
  }

  trackByFn = (index, project) => project.label;

  loadMore() {
    this.loading = true;
    this.store.dispatch(getTablesFilterProjectsOptions({searchString: this.formData.project || '', loadMore: true,  allowPublic: false}));
  }

  isFocused(locationRef: HTMLInputElement) {
    return document.activeElement === locationRef;
  }
}
