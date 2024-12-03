import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import {TagColorService} from '../../../services/tag-color.service';
import {Observable} from 'rxjs';
import {UserTagComponent} from '@common/shared/ui-components/tags/user-tag/user-tag.component';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {PushPipe} from '@ngrx/component';

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
  standalone: true,
  imports: [
    UserTagComponent,
    NgIf,
    NgForOf,
    AsyncPipe,
    PushPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagListComponent {
  public disableRemove: string;
  public tagsList = [] as Tag[];
  public maxTagHover: number;

  @Input() set tags(tags: string[]) {
    if (!tags) {
      return;
    }
    window.setTimeout(() => {
      this.tagsList = tags?.map((tag: string) => ({caption: tag, colorObservable: this.colorService.getColor(tag)}));
      if (this.tagsList) {
        window.setTimeout(() => {
          this.maxTagHover = this.ref.nativeElement.getBoundingClientRect().width
            - (this.tagsList.length - 1) * 24
            - 80 * (this.add.observed ? 1 : 0);
          this.cdr.detectChanges();
        }, 100);
      }
      this.disableRemove = null;
      this.cdr.detectChanges();
    });
  }
  @Input() sysTags = [] as string[];
  @Input() tooltip: boolean = false;
  @Input() readonly: boolean = false;
  @Output() remove = new EventEmitter();
  @Output() add = new EventEmitter<MouseEvent>();

  constructor(private colorService: TagColorService, private ref: ElementRef, private cdr: ChangeDetectorRef) { }

  public trackFn(index: number, tag: Tag) {
    return tag.caption;
  }

  removeTag(tag: string) {
    this.remove.emit(tag);
    this.disableRemove = tag;
  }
}
