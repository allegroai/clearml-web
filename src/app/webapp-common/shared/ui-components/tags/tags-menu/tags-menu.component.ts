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
import {getCompanyTags, getTags, openTagColorsMenu, setTagsFilterByProject} from '@common/core/actions/projects.actions';
import {ActivateEdit} from 'app/webapp-common/experiments/actions/common-experiments-info.actions';
import {ActivateModelEdit} from '@common/models/actions/models-info.actions';

@Component({
  selector: 'sm-tags-menu',
  templateUrl: './tags-menu.component.html',
  styleUrls: ['./tags-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagsMenuComponent {
  public filterText: string;
  private firstTime = true;

  get allTags(): string[] {
    return this.tagsFilterByProject ? this.projectTags : this.companyTags;
  }

  @Input() tags: string[];
  @Input() projectTags: string[];
  @Input() companyTags: string[] = [];
  @Input() tagsFilterByProject: boolean;
  @Output() tagSelected = new EventEmitter<string>();

  @ViewChild('nameInput') nameInput: ElementRef<HTMLInputElement>;


  constructor(private store: Store, private cdr: ChangeDetectorRef, private elRef: ElementRef) {
  }

  openTagColors() {
    window.setTimeout(() => {
      this.store.dispatch(new ActivateEdit('tags'));
      this.store.dispatch(new ActivateModelEdit('tags'));
    }, 500);
    this.store.dispatch(openTagColorsMenu());
  }

  addTag(tag: string) {
    if (!this.tags.includes(tag)) {
      this.tagSelected.emit(tag);
      this.filterText = '';
    }
    this.elRef.nativeElement.click();
  }

  focus() {
    if (this.tagsFilterByProject) {
      this.firstTime = true;
      this.store.dispatch(getTags());
    } else {
      this.firstTime = false;
      this.store.dispatch(getCompanyTags());
    }
    this.nameInput.nativeElement.focus();
    this.cdr.detectChanges();
  }

  clear() {
    this.filterText = '';
  }

  projectTagsFilterToggle(): void {
    if (this.tagsFilterByProject) {
      if (this.firstTime) {
        this.firstTime = false;
        this.store.dispatch(getCompanyTags());
      }
    } else {
      this.store.dispatch(getTags());
    }
    this.store.dispatch(setTagsFilterByProject({tagsFilterByProject: !this.tagsFilterByProject}));
  }

  trackByFn(index, item) {
    return item;
  }
}
