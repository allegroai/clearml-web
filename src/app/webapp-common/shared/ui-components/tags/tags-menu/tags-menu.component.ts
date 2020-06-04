import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import {Store} from '@ngrx/store';
import {openTagColorsMenu} from '../../../../core/actions/projects.actions';

@Component({
  selector       : 'sm-tags-menu',
  templateUrl    : './tags-menu.component.html',
  styleUrls      : ['./tags-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagsMenuComponent {
  filterText: string;

  @Input() tags: string[];
  @Input() allTags: string[];
  @Output() tagSelected = new EventEmitter<string>();

  @ViewChild('nameInput') nameInput: ElementRef<HTMLInputElement>;

  constructor(private store: Store, private cdr: ChangeDetectorRef) {
  }

  openTagColors() {
    this.store.dispatch(openTagColorsMenu());
  }

  addTag(tag: string) {
    if (!this.tags.includes(tag)) {
      this.tagSelected.emit(tag);
      this.filterText = '';
    }
  }

  focus() {
    this.nameInput.nativeElement.focus();
    this.cdr.detectChanges();
  }

  clear() {
    this.filterText = '';
  }

  clearSearch() {
    this.filterText = '';
  }
}
