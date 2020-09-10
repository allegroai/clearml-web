import {Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Store} from '@ngrx/store';
import {SetBackdrop} from '../../../../core/actions/layout.actions';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector   : 'sm-editable-section',
  templateUrl: './editable-section.component.html',
  styleUrls  : ['./editable-section.component.scss']
})
export class EditableSectionComponent implements OnInit, OnDestroy {
  @Input() editable;
  @Input() disableEditable = false;
  @Input() disableSave = false;
  @Input() disableInEditMode = false;
  @Input() hideSaveButton = false;
  @Input() containerClass = '';

  @Input() set saving(saving) {
    if (this._saving && !saving) {
      this.inEditMode = false;
    }
    this._saving = saving;
  }

  public inEditMode = false;

  get saving() {
    return this._saving;
  }

  private _saving = false;
  @Output() saveClicked = new EventEmitter();
  @Output() cancelClicked = new EventEmitter();

  @Output() activateEditClicked = new EventEmitter();

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (this.inEditMode && this.matDialog.openDialogs.length === 0) {
      if ((e.key == 'Escape')) {
        this.cancelClickedEvent();
      }
      if ((e.key == 'Enter') && e.ctrlKey === true && !this.disableSave) {
        this.saveSection();
      }
    }
  }

  constructor(private store: Store<any>, private matDialog: MatDialog) {
  }

  editModeChanged(editMode) {
    this.inEditMode = editMode;
    this.activateEditClicked.emit(editMode);
    this.store.dispatch(new SetBackdrop(editMode));
  }

  cancelClickedEvent() {
    this.inEditMode = false;
    this.store.dispatch(new SetBackdrop(false));
    this.cancelClicked.emit();
  }

  saveSection() {
    this.saveClicked.emit();
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    if (this.inEditMode) {
      this.cancelClickedEvent();
    }
  }

}
