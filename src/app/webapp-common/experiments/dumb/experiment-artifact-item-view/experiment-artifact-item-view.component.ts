import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Artifact} from '~/business-logic/model/tasks/artifact';
import {BaseClickableArtifactComponent} from '../base-clickable-artifact.component';
import {fileSizeConfigStorage} from '@common/shared/pipes/filesize.pipe';

@Component({
  selector: 'sm-experiment-artifact-item-view',
  templateUrl: './experiment-artifact-item-view.component.html',
  styleUrls: ['./experiment-artifact-item-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentArtifactItemViewComponent extends BaseClickableArtifactComponent{
  public isLocalFile: boolean;
  private _artifact: Artifact;

  @Input() editable: boolean;
  public isLinkable: boolean;
  public fileSizeConfigStorage = fileSizeConfigStorage;

  @Input() set artifact(artifact: Artifact) {
    this._artifact = artifact;
    if(artifact){
      this.timestamp = artifact.timestamp;
      this.isLocalFile = artifact.uri && this.adminService.isLocalFile(artifact.uri);
      this.isLinkable = artifact.type_data && ['text/html'].includes(artifact.type_data.content_type);
    }
  }

  get artifact(): Artifact {
    return this._artifact;
  }

  linkClicked(event: Event) {
    this.signUrl(this.artifact.uri).subscribe(signed => {
      const a = document.createElement('a');
      a.href = signed;
      a.target = '_blank';
      a.click();
    });
    event.preventDefault();
  }
}
