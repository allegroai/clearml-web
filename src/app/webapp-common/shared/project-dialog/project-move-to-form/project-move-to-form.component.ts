import {ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {Project} from '../../../../business-logic/model/projects/project';
import {NgForm} from '@angular/forms';
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";


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

  constructor(private changeDetection: ChangeDetectorRef) {
  }

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

  @Output() moveProject = new EventEmitter();
  @Output() dismissDialog = new EventEmitter();
  @ViewChild('projectForm') public form: NgForm;

  send() {
    this.moveProject.emit({location: this.project.parent, name: this.projectName});
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
}

