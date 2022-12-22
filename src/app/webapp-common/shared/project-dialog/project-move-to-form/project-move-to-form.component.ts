import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {Project} from '~/business-logic/model/projects/project';
import {NgForm} from '@angular/forms';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatOptionSelectionChange} from '@angular/material/core';
import {ShortProjectNamePipe} from '@common/shared/pipes/short-project-name.pipe';
import {ProjectLocationPipe} from '@common/shared/pipes/project-location.pipe';


@Component({
  selector: 'sm-project-move-to-form',
  templateUrl: './project-move-to-form.component.html',
  styleUrls: ['./project-move-to-form.component.scss']
})
export class ProjectMoveToFormComponent implements OnChanges, OnInit {
  public projectName: string;
  public isAutoCompleteOpen: boolean;
  public filterText: string = '';
  public projectsNames: Array<string>;
  public project = {
    parent: ''
  };
  private _projects: Project[];

  @ViewChild('moveToForm', {static: true}) moveToForm: NgForm;
  private newProjectName: string;

  constructor(
    private changeDetection: ChangeDetectorRef,
    private shortProjectName: ShortProjectNamePipe,
    private projectLocation: ProjectLocationPipe
) {}

  ngOnInit(): void {
  }


  @Input() set projects(projects) {
    this._projects = projects;
    this.projectsNames = ['Projects root'].concat(projects.map(project => project.name));
  }

  get projects(): Project[] {
    return this._projects;
  }

  @Input() baseProjectId;

  @Output() moveProject = new EventEmitter<{location: string; name: string; fromName: string; toName: string; projectName: string}>();
  @Output() dismissDialog = new EventEmitter();
  @ViewChild('projectForm') public form: NgForm;

  send() {
    this.moveProject.emit({
      location: this.project.parent,
      name: this.newProjectName,
      projectName: this.shortProjectName.transform(this.projectName),
      fromName: this.projectLocation.transform(this.projectName),
      toName: this.project.parent
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.projects.length > 0 && this.baseProjectId) {
      this.projectName = this.projects.find(project => project.id === this.baseProjectId)?.name;
    }
  }

  detectChanges() {
    // this.form.controls.projectName.updateValueAndValidity();
    this.changeDetection.detectChanges();
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

  createNewSelected($event: MatOptionSelectionChange<any>) {
    this.newProjectName = $event.source.value;
  }

  optionSelected($event: MatOptionSelectionChange<any>) {
    this.newProjectName = null;
  }
}

