import {ChangeDetectionStrategy, Component, Input, Output, EventEmitter} from '@angular/core';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';

@Component({
  selector: 'sm-clear-filters-button',
  templateUrl: `./clear-filters-button.component.html`,
  styleUrls: ['./clear-filters-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    TooltipDirective
  ]
})
export class ClearFiltersButtonComponent {

  @Input() set tableFilters(tableFilters: { [s: string]: FilterMetadata }) {
    this.isTableFiltered = Object.values(tableFilters ?? {}).some(({value}) => value?.length > 0);
  };
  @Output() clearTableFilters = new EventEmitter<null>();

  public isTableFiltered: boolean;
}
