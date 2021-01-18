import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import {SelectableListItem} from './selectable-list.model';

@Component({
  selector       : 'sm-selectable-list',
  templateUrl    : './selectable-list.component.html',
  styleUrls      : ['./selectable-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectableListComponent implements OnChanges{
  public showList: SelectableListItem[] = [];

  @Input() list: SelectableListItem[] = [];
  @Input() checkedList: string[];
  @Input() selected: SelectableListItem['value'];
  @Input() checkIcon: string[]               = ['fa-eye', 'fa-eye-slash'];
  @Output() onItemSelect                   = new EventEmitter<string>();
  @Output() onItemCheck                    = new EventEmitter<string>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes.list || changes.checkedList)) {
      this.showList = this.list.map(item => ({...item, visible: !this.checkedList.includes(item.name) } as SelectableListItem));
      this.cdr.detectChanges();
    }
  }
}
