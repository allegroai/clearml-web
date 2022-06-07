import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output} from '@angular/core';
import {TagColorService} from '../../../services/tag-color.service';
import {Observable} from 'rxjs';

export interface Tag {
  caption: string;
  colorObservable: Observable<{
    background: string;
    foreground: string;
  }>;
}

@Component({
  selector: 'sm-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagListComponent {
  public disableRemove: string;
  tagsList = [] as Tag[];

  @Input() set tags(tags: string[]) {
    this.tagsList = tags?.map((tag: string) => ({caption: tag, colorObservable: this.colorService.getColor(tag)}));
    this.disableRemove = null;
  }
  @Input() sysTags = [] as string[];
  @Input() tooltip: boolean = false;
  @Output() remove = new EventEmitter();
  @Output() add = new EventEmitter<MouseEvent>();

  constructor(private colorService: TagColorService, public ref: ElementRef) { }

  public trackFn(index: number, tag: Tag) {
    return tag.caption;
  }

  removeTag(tag: string) {
    this.remove.emit(tag);
    this.disableRemove = tag;
  }
}
