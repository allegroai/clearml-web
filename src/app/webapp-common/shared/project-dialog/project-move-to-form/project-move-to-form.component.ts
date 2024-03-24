import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges, OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import {Project} from '~/business-logic/model/projects/project';
import {FormsModule, NgForm} from '@angular/forms';
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatOptionSelectionChange} from '@angular/material/core';
import {ShortProjectNamePipe} from '@common/shared/pipes/short-project-name.pipe';
import {ProjectLocationPipe} from '@common/shared/pipes/project-location.pipe';
import {Subscription} from 'rxjs';
import {rootProjectsPageSize} from '@common/constants';
import {MatInputModule} from '@angular/material/input';
import {StringIncludedInArrayPipe} from '@common/shared/pipes/string-included-in-array.pipe';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {SearchTextDirective} from '@common/shared/ui-components/directives/searchText.directive';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {ScrollEndDirective} from '@common/shared/ui-components/directives/scroll-end.directive';
import {UniqueNameValidatorDirective} from '@common/shared/ui-components/template-forms-ui/unique-name-validator.directive';
import {UniqueProjectValidator} from '@common/shared/project-dialog/unique-project.validator';
import {ShowTooltipIfEllipsisDirective} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';
import {InvalidPrefixValidatorDirective} from '@common/shared/ui-components/template-forms-ui/invalid-prefix-validator.directive';
import {UniquePathValidatorDirective} from '@common/shared/ui-components/template-forms-ui/unique-path-validator.directive';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';
import {DotsLoadMoreComponent} from '@common/shared/ui-components/indicators/dots-load-more/dots-load-more.component';


@Component({
  selector: 'sm-project-move-to-form',
  templateUrl: './project-move-to-form.component.html',
  styleUrls: ['./project-move-to-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatInputModule,
    FormsModule,
    MatAutocompleteModule,
    StringIncludedInArrayPipe,
    ClickStopPropagationDirective,
    TooltipDirective,
    SearchTextDirective,
    MatProgressSpinnerModule,
    ScrollEndDirective,
    UniqueNameValidatorDirective,
    UniqueProjectValidator,
    ShowTooltipIfEllipsisDirective,
    ShortProjectNamePipe,
    ProjectLocationPipe,
    InvalidPrefixValidatorDirective,
    UniquePathValidatorDirective,
    LabeledFormFieldDirective,
    DotsLoadMoreComponent

  ]
})
export class ProjectMoveToFormComponent implements OnChanges, AfterViewInit, OnDestroy {
  public readonly projectsRoot = 'Projects root';
  public rootFiltered: boolean;
  public projectName: string;
  public isAutoCompleteOpen: boolean;
  public filterText: string = '';
  public projectsNames: Array<string>;
  public project = {
    parent: null
  };
  private _projects: Project[];
  private newProjectName: string;
  private subs = new Subscription();
  @ViewChild('moveToForm', {static: true}) moveToForm: NgForm;
  public loading: boolean;
  public noMoreOptions: boolean;
  private previousLength: number | undefined;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.subs.add(this.moveToForm.controls['projectName'].valueChanges.subscribe(searchString => {
          if (searchString !== this.project.parent) {
            this.searchChanged(searchString || '');
          }
        })
      );
    });
  }


  @Input() set projects(projects) {
    this.loading = false;
    this.noMoreOptions = projects?.length === this.previousLength || projects?.length < rootProjectsPageSize;
    this.previousLength = projects?.length;

    this._projects = projects;
    if (!projects) {
      return;
    }
    this.projectsNames = [
      ...(this.rootFiltered ? [] : [this.projectsRoot]),
      ...projects.map(project => project.name)
    ];
  }

  get projects(): Project[] {
    return this._projects;
  }

  @Input() baseProject;

  @Output() filterSearchChanged = new EventEmitter<{ value: string; loadMore?: boolean }>();
  @Output() moveProject = new EventEmitter<{ location: string; name: string; fromName: string; toName: string; projectName: string }>();
  @Output() dismissDialog = new EventEmitter();
  @ViewChild('projectForm') public form: NgForm;

  send() {
    this.moveProject.emit({
      location: this.project.parent,
      name: this.newProjectName,
      projectName: new ShortProjectNamePipe().transform(this.projectName),
      fromName: new ProjectLocationPipe().transform(this.projectName),
      toName: this.project.parent
    });
  }

  ngOnChanges() {
    if (this.projects?.length > 0 && this.baseProject) {
      this.projectName = this.baseProject?.name ?? this.projectsRoot;
      // if (this.baseProject && this.project.parent === null) {
      //   this.project.parent = this.baseProject.name;
      // }
    }
  }

  clear() {
    this.project.parent = '';
  }

  setIsAutoCompleteOpen(focus: boolean) {
    this.isAutoCompleteOpen = focus;
  }


  locationSelected($event: MatAutocompleteSelectedEvent) {
    this.project.parent = $event.option.value;
  }

  closeDialog() {
    this.dismissDialog.emit();
  }

  createNewSelected($event: MatOptionSelectionChange<string>) {
    this.newProjectName = $event.source.value;
  }

  optionSelected() {
    this.newProjectName = null;
  }

  searchChanged(searchString: string) {
    this.projectsNames = null;
    this.rootFiltered = !this.projectsRoot.includes(searchString);
    searchString !== null && this.filterSearchChanged.emit({value: searchString});
  }

  loadMore(searchString) {
    this.loading = true;
    this.filterSearchChanged.emit({value: searchString || '', loadMore: true});
  }

  isFocused(locationRef: HTMLInputElement) {
    return document.activeElement === locationRef;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}

