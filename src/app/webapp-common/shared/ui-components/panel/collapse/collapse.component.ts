import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';

@Component({
  selector       : 'al-collapse',
  templateUrl    : './collapse.component.html',
  styleUrls      : ['./collapse.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollapseComponent {
  private _expanded: any;
  public contentAttached     = false;
  public expandLoadingActive = false;
  public isFinishExpanding: boolean;
  public animationActive: boolean;

  @Input() set expanded(expanded: boolean) {
    this._expanded = expanded;
    if (expanded) {
      this.contentAttached = this.expanded;
    } else {
      this.isFinishExpanding = false;
    }
  }

  get expanded() {
    return this._expanded;
  }

  @Input() header: string;
  @Input() disabled: boolean;
  @Input() headerClass: string = '';
  @Input() panelClass: string  = '';

  @Output() collapseToggled = new EventEmitter<boolean>();

  @ViewChild('panel', {static: true}) panel: MatExpansionPanel;


  toggleOpen() {
    this.animationActive = true;
    if (this.panel.expanded) {
      this.contentAttached     = true;
      this.expandLoadingActive = true;
    }
    setTimeout(() => {
        this.collapseToggled.emit(this.panel.expanded);
        this.expandLoadingActive = false;
      }
    );
  }

  afterAnimation(isCollapse) {
    this.animationActive = false;
    if (isCollapse === false) {
      this.contentAttached = false;
    }
    this.isFinishExpanding = isCollapse;
  }
}
