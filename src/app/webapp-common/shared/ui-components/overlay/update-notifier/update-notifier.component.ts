import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector   : 'sm-update-notifier',
  templateUrl: './update-notifier.component.html',
  styleUrls  : ['./update-notifier.component.scss']
})
export class UpdateNotifierComponent implements OnInit {
  public active      = false;
  areAvailableUpdates = false;
  private _availableUpdates: any;
  public newVersionUrl: string;
  public newVersionName: string;

  @Input() dismissedVersion: string;

  @Input() set availableUpdates(availableUpdates) {
    this.areAvailableUpdates = availableUpdates && (availableUpdates['trains-server']['newer_available']);
    this.newVersionUrl       = availableUpdates && (availableUpdates['trains-server']['url']);
    this.newVersionName      = availableUpdates && (availableUpdates['trains-server']['version']);
    this._availableUpdates   = availableUpdates;
    if (this.areAvailableUpdates && this.dismissedVersion !== this.newVersionName) {
      this.active = true;
      this.notifierActive.emit(true);
    }
  }

  @Output() versionDismissed = new EventEmitter();
  @Output() notifierActive = new EventEmitter();

  get availableUpdates() {
    return this._availableUpdates;
  }

  constructor() {
  }

  ngOnInit() {
  }

  dismiss() {
    this.active = false;
    this.notifierActive.emit(false);
    this.versionDismissed.emit(this.newVersionName);
  }

  show() {
    this.active = true;
    this.notifierActive.emit(true);
  }
}
