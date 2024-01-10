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
import {NgForOf} from '@angular/common';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';

@Component({
  selector: 'sm-selectable-list',
  templateUrl: './selectable-list.component.html',
  styleUrls: ['./selectable-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgForOf,
    TooltipDirective
  ]
})
export class SelectableListComponent implements OnChanges{
  public showList: SelectableListItem[] = [];

  @Input() list: SelectableListItem[] = [];
  @Input() checkedList: string[];
  @Input() checkIcon: string[]               = ['al-ico-show', 'al-ico-hide'];
  @Output() onItemSelect                   = new EventEmitter<string>();
  @Output() onItemCheck                    = new EventEmitter<string>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes.list || changes.checkedList)) {
      this.showList = this.list.map(item => ({...item, visible: this.checkedList?.includes(item.name) } as SelectableListItem));
      this.cdr.detectChanges();
    }
  }

  trackByValue = (index: number, item) => item.value;
}
