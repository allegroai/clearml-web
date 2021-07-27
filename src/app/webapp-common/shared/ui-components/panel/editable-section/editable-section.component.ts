import {Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Store} from '@ngrx/store';
import {setBackdrop} from '@common/core/actions/layout.actions';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector   : 'sm-editable-section',
  templateUrl: './editable-section.component.html',
  styleUrls  : ['./editable-section.component.scss']
})
export class EditableSectionComponent implements OnInit, OnDestroy {
  public inEditMode = false;

  @Input() editable;
  @Input() disableEditable = false;
  @Input() disableSave = false;
  @Input() disableInEditMode = false;
  @Input() hideSaveButton = false;
  @Input() containerClass = '';
  @Input() hideEditButton = false;
  @Input() isDarkTheme = false;

  private _saving = false;
  @Input() set saving(saving) {
    if (this._saving && !saving) {
      this.inEditMode = false;
    }
    this._saving = saving;
  }

  get saving(): boolean {
    return this._saving;
  }

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

  constructor(private store: Store<any>, private matDialog: MatDialog, public elementRef: ElementRef) {
  }

  editModeChanged(editMode) {
    this.inEditMode = editMode;
    this.activateEditClicked.emit(editMode);
    this.store.dispatch(setBackdrop({payload: editMode}));
  }

  cancelClickedEvent() {
    this.inEditMode = false;
    this.store.dispatch(setBackdrop({payload: false}));
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
