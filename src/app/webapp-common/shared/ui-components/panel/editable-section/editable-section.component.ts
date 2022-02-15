import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {Store} from '@ngrx/store';
import {setBackdrop} from '@common/core/actions/layout.actions';
import {MatDialog} from '@angular/material/dialog';
import {fromEvent, Subscription} from 'rxjs';
import {delay, first, tap, throttleTime} from 'rxjs/operators';

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
  private scrollSub: Subscription;
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
    if(editMode) {
      setTimeout(() => {
        this.listenScrollEvent();
      }, 50);
    } else {
      this.unsubscribeToEventListener();
    }
  }

  cancelClickedEvent() {
    this.inEditMode = false;
    this.store.dispatch(setBackdrop({payload: false}));
    this.cancelClicked.emit();
    this.unsubscribeToEventListener();
  }

  saveSection() {
    this.saveClicked.emit();
    this.unsubscribeToEventListener();
  }

  ngOnInit() {
  }

  unsubscribeToEventListener() {
    this.scrollSub?.unsubscribe();
  }

  getEdges() {
    const {top, height, bottom} = this.elementRef.nativeElement.getBoundingClientRect();
    return {
      top,
      bottom,
      height
    };
  }
  ngOnDestroy(): void {
    this.unsubscribeToEventListener();
    if (this.inEditMode) {
      this.cancelClickedEvent();
    }
  }

  private listenScrollEvent() {
    const {height: initHeight} = this.getEdges();
    let initBottom;
    const factor = initHeight / 2;

    const scroll$ = fromEvent(window,'wheel', {passive: false}).pipe(
      tap(() => {
        if (initBottom === undefined) {
          const {bottom: currentBottom} = this.getEdges();
          initBottom = currentBottom;
        }
      }),
      throttleTime(10),
      tap((event: WheelEvent) => {
        const {bottom: currentBottom} = this.getEdges();
        const deltaY = Math.abs(event.deltaY);

        const isDownDirection = event.deltaY > 0;
        const isTopEdge = !isDownDirection && initBottom + factor - deltaY < currentBottom;
        const isBottomEdge = isDownDirection && initBottom - currentBottom - deltaY > factor;

        const scrolledMoreThanHeight = Math.abs(initBottom - currentBottom ) > initHeight;

        if (deltaY > factor || scrolledMoreThanHeight) {
          this.elementRef.nativeElement.scrollIntoView({behavior: 'smooth', block: 'nearest'});
          event.preventDefault();
          return;
        }
        if ( isBottomEdge || isTopEdge)  {
          event.preventDefault();
        }

      })
    );
    this.scrollSub = scroll$.subscribe();
  }
}
