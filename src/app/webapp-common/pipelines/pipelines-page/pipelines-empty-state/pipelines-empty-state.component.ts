import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, Optional} from '@angular/core';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';

@Component({
  selector: 'sm-pipelines-empty-state',
  templateUrl: './pipelines-empty-state.component.html',
  styleUrls: ['./pipelines-empty-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PipelinesEmptyStateComponent{

  @Input() initPipelineCode: string;
  @Input() createButton: boolean = false;
  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data: {pipelineCode?: string},
              private cdr: ChangeDetectorRef) {
    if (this.data?.pipelineCode) {
      window.setTimeout(()=> {
        this.initPipelineCode = this.data?.pipelineCode;
        this.cdr.detectChanges();
      }, 300);
    }
  }
}
