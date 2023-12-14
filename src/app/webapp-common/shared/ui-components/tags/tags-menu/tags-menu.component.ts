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
import {openTagColorsMenu, setTagsFilterByProject} from '@common/core/actions/projects.actions';
import {activateEdit} from 'app/webapp-common/experiments/actions/common-experiments-info.actions';
import {activateModelEdit} from '@common/models/actions/models-info.actions';
import {selectRouterParams} from "@common/core/reducers/router-reducer";
import {map} from "rxjs/operators";
import {Observable} from "rxjs";

@Component({
  selector: 'sm-tags-menu',
  templateUrl: './tags-menu.component.html',
  styleUrls: ['./tags-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagsMenuComponent {
  public filterText: string;
  private firstTime = true;
  public disableFilterByProject$: Observable<boolean>;

  get allTags(): string[] {
    return this.tagsFilterByProject ? this.projectTags : this.companyTags;
  }

  @Input() tags: string[];
  @Input() projectTags: string[];
  @Input() companyTags: string[] = [];
  @Input() tagsFilterByProject: boolean;
  @Output() tagSelected = new EventEmitter<string>();
  @Output() getTags = new EventEmitter();
  @Output() getCompanyTags = new EventEmitter();

  @ViewChild('nameInput') nameInput: ElementRef<HTMLInputElement>;


  constructor(private store: Store, private cdr: ChangeDetectorRef, private elRef: ElementRef) {
    this.disableFilterByProject$ = this.store.select(selectRouterParams)
      .pipe(map(params => params?.projectId === '*'));
  }

  openTagColors() {
    window.setTimeout(() => {
      this.store.dispatch(activateEdit('tags'));
      this.store.dispatch(activateModelEdit('tags'));
    }, 500);
    this.store.dispatch(openTagColorsMenu({tags: this.tagsFilterByProject ? this.projectTags : this.companyTags}));
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
      this.getTags.emit();
      // this.store.dispatch(getTags());
    } else {
      this.firstTime = false;
      this.getCompanyTags.emit();
      //this.store.dispatch(getCompanyTags());
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
        this.getCompanyTags.emit();
        // this.store.dispatch(getCompanyTags());
      }
    }
    this.store.dispatch(setTagsFilterByProject({tagsFilterByProject: !this.tagsFilterByProject}));
  }

  trackByFn(index, item) {
    return item;
  }
}
