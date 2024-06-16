import {ChangeDetectionStrategy, Component, computed, EventEmitter, input, model, Output, TemplateRef} from '@angular/core';
import {CustomColumnMode} from '../../shared/common-experiments.const';
import {ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import {
  SelectMetricForCustomColComponent
} from '@common/experiments/dumb/select-metric-for-custom-col/select-metric-for-custom-col.component';
import {MenuComponent} from '@common/shared/ui-components/panel/menu/menu.component';
import {CustomColumnsListComponent} from '@common/shared/components/custom-columns-list/custom-columns-list.component';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {SelectHyperParamsForCustomColComponent} from '@common/experiments/dumb/select-hyper-params-for-custom-col/select-hyper-params-for-custom-col.component';
import {NgTemplateOutlet, UpperCasePipe} from '@angular/common';

@Component({
  selector: 'sm-custom-cols-menu',
  templateUrl: './experiment-custom-cols-menu.component.html',
  styleUrls: ['./experiment-custom-cols-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MenuComponent,
    CustomColumnsListComponent,
    ClickStopPropagationDirective,
    SelectMetricForCustomColComponent,
    SelectHyperParamsForCustomColComponent,
    NgTemplateOutlet,
    UpperCasePipe
  ],
  standalone: true
})
export class ExperimentCustomColsMenuComponent {

  sections = input<{title?: string; name: string; options: any[]; skipValue?: boolean; template: TemplateRef<any>}[]>();
  menuHeader = input<string>();
  topTitle = input<string>();
  menuTooltip = input<string>();
  sectionsTitle = input<string>();
  selectable = input<boolean>(true);
  tableCols = input<ISmCol[]>()
  disabled = input<boolean>();
  isLoading = input<boolean>();
  darkTheme = input<boolean>();
  customColumnMode = model(CustomColumnMode.Standard as CustomColumnMode);
  hasSecondSection = computed(() =>
    Object.values(this.sections()?.[1]?.options ?? {}).some(section =>  Object.keys(section).length > 0));

  @Output() getMetricsToDisplay = new EventEmitter();
  @Output() removeColFromList = new EventEmitter<ISmCol['id']>();
  @Output() selectedTableColsChanged = new EventEmitter<ISmCol>();

  public customColumnModeEnum = CustomColumnMode;

}
