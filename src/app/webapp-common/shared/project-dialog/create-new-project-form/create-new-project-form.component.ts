import {ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {URI_REGEX} from '../../../../app.constants';
import {Project} from '../../../../business-logic/model/projects/project';
import {NgForm} from '@angular/forms';
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";


@Component({
  selector: 'sm-create-new-project-form',
  templateUrl: './create-new-project-form.component.html',
  styleUrls: ['./create-new-project-form.component.scss']
})
export class CreateNewProjectFormComponent implements OnChanges {
  constructor(private changeDetection: ChangeDetectorRef) {
  }

  public projectsNames: Array<string>;
  public outputDestPattern = `${URI_REGEX.S3_WITH_BUCKET}$|${URI_REGEX.S3_WITH_BUCKET_AND_HOST}$|${URI_REGEX.FILE}$|${URI_REGEX.NON_AWS_S3}$|${URI_REGEX.GS_WITH_BUCKET}$|${URI_REGEX.GS_WITH_BUCKET_AND_HOST}$`;
  public project = {
    name: '',
    description: '',
    default_output_destination: null,
    system_tags: [],
    parent: ''
  };
  private _projects: Project[];


  @Input() set projects(projects) {
    this._projects = projects;
    this.projectsNames = ['Projects root'].concat(projects.map(project => project.name));
    // this.projectsNames =projects.map(project => project.name);
  }

  get projects(): Project[] {
    return this._projects;
  }

  @Input() baseProjectId;

  @Output() projectCreated = new EventEmitter();
  @ViewChild('projectForm') public form: NgForm;
  isAutoCompleteOpen: boolean;

  send() {
    if (this.project.default_output_destination === '') {
      this.project.default_output_destination = null;
    }
    this.projectCreated.emit(this.project);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.projects.length > 0) {
      this.project.parent = this.baseProjectId? this.projects.find(project => project.id === this.baseProjectId)?.name: 'Projects root';
    }
  }

  detectChanges() {
    // this.form.controls.projectName.updateValueAndValidity();
    this.changeDetection.detectChanges();
  }

  clearLocation() {
    this.project.parent = '';
  }


  setIsAutoCompleteOpen(focus: boolean) {
    this.isAutoCompleteOpen = focus;
  }

  locationSelected($event: MatAutocompleteSelectedEvent) {
    this.project.parent = $event.option.value;
  }
}

