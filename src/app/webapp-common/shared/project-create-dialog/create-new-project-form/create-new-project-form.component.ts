import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {URI_REGEX} from '../../../../app.constants';


@Component({
  selector   : 'sm-create-new-project-form',
  templateUrl: './create-new-project-form.component.html',
  styleUrls  : ['./create-new-project-form.component.scss']
})
export class CreateNewProjectFormComponent {
  public projectsNames: Array<string>;
  public outputDestPattern = `${URI_REGEX.S3_WITH_BUCKET}$|${URI_REGEX.S3_WITH_BUCKET_AND_HOST}$|${URI_REGEX.FILE}$|${URI_REGEX.NON_AWS_S3}$|${URI_REGEX.GS_WITH_BUCKET}$|${URI_REGEX.GS_WITH_BUCKET_AND_HOST}$`;
  public project           = {
    name                      : '',
    description               : '',
    default_output_destination: null,
    system_tags                      : []
  };

  @Input() set projects(projects) {
    this.projectsNames = projects.map(project => project.name);
  }

  @Output() projectCreated = new EventEmitter();

  send() {
    if (this.project.default_output_destination === '') {
      this.project.default_output_destination = null;
    }
    this.projectCreated.emit(this.project);
  }
}
