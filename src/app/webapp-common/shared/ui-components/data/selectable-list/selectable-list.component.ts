import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject, input, output, computed
} from '@angular/core';
import {SelectableListItem} from './selectable-list.model';

import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';

@Component({
  selector: 'sm-selectable-list',
  templateUrl: './selectable-list.component.html',
  styleUrls: ['./selectable-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    TooltipDirective
  ]
})
export class SelectableListComponent {
      private cdr = inject(ChangeDetectorRef);

  list = input<SelectableListItem[]>([]);
  checkedList = input<string[]>();
  checkIcon = input<string[]>(['al-ico-show', 'al-ico-hide']);
  theme = input<'light' | 'dark'>('light');
  onItemSelect = output<string>();
  onItemCheck = output<string>();

  protected showList = computed<SelectableListItem[] >(() => this.list().map(item => ({...item, visible: this.checkedList()?.includes(item.name) } as SelectableListItem)));
}
