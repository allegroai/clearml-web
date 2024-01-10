import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output, QueryList,
  ViewChild, ViewChildren
} from '@angular/core';
import {Store} from '@ngrx/store';
import {openTagColorsMenu, setTagsFilterByProject} from '@common/core/actions/projects.actions';
import {activateEdit} from '@common/experiments/actions/common-experiments-info.actions';
import {activateModelEdit} from '@common/models/actions/models-info.actions';
import {selectRouterParams} from '@common/core/reducers/router-reducer';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {MatMenu, MatMenuModule} from '@angular/material/menu';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {FilterPipe} from '@common/shared/pipes/filter.pipe';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {A11yModule} from '@angular/cdk/a11y';
import {
  ShowTooltipIfEllipsisDirective
} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';

@Component({
  selector: 'sm-tags-menu',
  templateUrl: './tags-menu.component.html',
  styleUrls: ['./tags-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatMenuModule,
    MatInputModule,
    FormsModule,
    NgIf,
    AsyncPipe,
    NgForOf,
    FilterPipe,
    TooltipDirective,
    ClickStopPropagationDirective,
    A11yModule,
    ShowTooltipIfEllipsisDirective
  ]
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

  @ViewChild(MatMenu) matMenu: MatMenu;
  @ViewChild('nameInput') nameInput: ElementRef<HTMLInputElement>;
  @ViewChildren('tagCreateButton') createButtons: QueryList<HTMLButtonElement>;
  @ViewChildren('tagButton') buttons: QueryList<HTMLButtonElement>;


  constructor(private readonly store: Store, private readonly cdr: ChangeDetectorRef, private readonly elRef: ElementRef) {
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
    if (tag?.trim().length > 0 && !this.tags.includes(tag)) {
      this.tagSelected.emit(tag);
      this.filterText = '';
    }
    this.elRef.nativeElement.blur();
  }

  focus(event?: Event) {
    event?.preventDefault();
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
