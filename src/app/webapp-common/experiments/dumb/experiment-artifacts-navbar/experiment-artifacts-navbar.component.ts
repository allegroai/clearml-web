import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Artifact} from '../../../../business-logic/model/tasks/artifact';

type ActiveSection = 'model' | 'artifact' | 'other';
export const ACTIVE_SECTIONS = {
  'model'   : 'model' as ActiveSection,
  'artifact': 'artifact' as ActiveSection,
  'other'   : 'other' as ActiveSection,
};

@Component({
  selector   : 'sm-experiment-artifacts-navbar',
  templateUrl: './experiment-artifacts-navbar.component.html',
  styleUrls  : ['./experiment-artifacts-navbar.component.scss']
})
export class ExperimentArtifactsNavbarComponent {
  readonly DATA_AUDIT_TABLE = 'data-audit-table';
  public dataAuditArtifacts: Artifact[];
  public otherArtifacts: Artifact[];
  public ACTIVE_SECTIONS    = ACTIVE_SECTIONS;

  @Input() set artifacts(artifacts: Array<Artifact>) {
    if (artifacts) {
      this.dataAuditArtifacts = artifacts.filter(artifact => artifact.type === this.DATA_AUDIT_TABLE);
      this.otherArtifacts     = artifacts.filter(artifact => artifact.type !== this.DATA_AUDIT_TABLE);
    }
  }

  @Input() selectedArtifactKey;
  @Input() outputModel;
  @Input() activeSection;
  @Input() routerConfig: string[];
  @Output() artifactSelected = new EventEmitter();

  constructor() {
  }

  trackByFn(index, artifact) {
    return (artifact.key + artifact.mode);
  }
}
