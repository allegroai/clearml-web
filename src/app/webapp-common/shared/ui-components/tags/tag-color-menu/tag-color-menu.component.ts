import {Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectProjectTags} from '../../../../core/reducers/projects.reducer';
import {map} from 'rxjs/operators';
import {TagColorService} from '../../../services/tag-color.service';
import {Tag} from '../tag-list/tag-list.component';
import {MatDialogRef} from '@angular/material/dialog';
import {DeactivateEdit} from '../../../../experiments/actions/common-experiments-info.actions';
import {CancelModelEdit} from '../../../../models/actions/models-info.actions';

@Component({
  selector: 'sm-tag-color-menu',
  templateUrl: './tag-color-menu.component.html',
  styleUrls: ['./tag-color-menu.component.scss']
})
export class TagColorMenuComponent implements OnDestroy {
  filterText: string;
  public tags$: Observable<Tag[]>;
  defaultColor: string;
  toggle: boolean;
  presetColors = TagColorService.predefined.map(color => color.background) as string[];
  currTag: string;

  @ViewChild('nameInput') nameInput: ElementRef<HTMLInputElement>;

  constructor(
    private store: Store, private colorService: TagColorService,
    private matDialogRef: MatDialogRef<TagColorMenuComponent>
  ) {
    this.tags$ = this.store.select(selectProjectTags)
      .pipe(
        map((tags: string[]) => tags.map(tag => ({caption: tag, colorObservable: this.colorService.getColor(tag)} as Tag))));
  }

  close() {
    this.matDialogRef.close();
  }

  setForeground(tag: string, color: string) {
    this.colorService.setColor(tag, {foreground: color});
  }

  setBackground(tag: string, color: string) {
    this.colorService.setColor(tag, {background: color});
  }

  openColorPicker(tag: string, color: string) {
    this.currTag = tag;
    this.defaultColor = color;
    this.toggle = true;
  }

  clearSearch() {
    this.filterText = '';
  }

  ngOnDestroy(): void {
    this.store.dispatch(new DeactivateEdit());
    this.store.dispatch(new CancelModelEdit());
  }
}
