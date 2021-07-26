import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {CircleCounterComponent} from './indicators/circle-counter/circle-counter.component';
import {CardComponent} from './panel/card/card.component';
import {PlusCardComponent} from './panel/plus-card/plus-card.component';
import {NumberCounterComponent} from './indicators/number-counter/number-counter.component';

import {ClipboardModule} from 'ngx-clipboard';

import {NeonButtonComponent} from './buttons/neon-button/neon-button.component';
import {MenuComponent} from './panel/menu/menu.component';
import {SearchComponent} from './inputs/search/search.component';
import {NavbarItemComponent} from './panel/navbar-item/navbar-item.component';
import {ButtonToggleComponent} from './inputs/button-toggle/button-toggle.component';
import {ConfirmDialogComponent} from './overlay/confirm-dialog/confirm-dialog.component';

import {CodeComponent} from './data/code/code.component';
import {DialogTemplateComponent} from './overlay/dialog-template/dialog-template.component';
import {SMMaterialModule} from '../material/material.module';
import {AlertDialogComponent} from './overlay/alert-dialog/alert-dialog.component';
import {TooltipDirective} from './indicators/tooltip/tooltip.directive';
import {CheckboxControlComponent} from './forms/checkbox-control/checkbox-control.component';
import {SimpleTableComponent2} from './data/simple-table/simple-table.component';
import {ChipsModule} from './buttons/chips/chips.module';
import {TermsOfUseDialogComponent} from './overlay/terms-of-use-dialog/terms-of-use-dialog.component';
import {LeafComponent} from './overlay/leaf/leaf.component';
import {WizardDialogStepComponent} from './overlay/wizard-dialog-step/wizard-dialog-step.component';
import {LabeledRowComponent} from './data/labeled-row/labeled-row.component';
import {CircleStatusComponent} from './indicators/circle-status/circle-status.component';
import {MenuItemComponent} from './panel/menu-item/menu-item.component';
import {ClickStopPropagationDirective} from './directives/click-stop-propagation.directive';
import {TableComponent} from './data/table/table.component';
import {TableFilterSortTemplateComponent} from './data/table/table-filter-sort-template/table-filter-sort-template.component';
import {CompareFooterComponent} from './panel/compare-footer/compare-footer.component';
import {IconLabelComponent} from './data/icon-label/icon-label.component';
import {SelectableListComponent} from './data/selectable-list/selectable-list.component';
import {SelectableFilterListComponent} from './data/selectable-filter-list/selectable-filter-list.component';
import {ThrottledScrollListenerDirective} from './directives/throttled-scroll-listener.directive';

import {SharedPipesModule} from '../pipes/shared-pipes.module';
import {TableCardComponent} from './data/table-card/table-card.component';
import {ToggleArchiveComponent} from './buttons/toggle-archive/toggle-archive.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatDatepickerModule} from '@angular/material/datepicker';

import {TableCardFilterTemplateComponent} from './data/table/table-card-filter-template/table-card-filter-template.component';
import {EditableSectionComponent} from './panel/editable-section/editable-section.component';
import {LoadingButtonComponent} from './buttons/loading-button/loading-button.component';
import {OverlayComponent} from './overlay/overlay/overlay.component';
import {ChooseColorModule} from './directives/choose-color/choose-color.module';
import {PortalModule} from '@angular/cdk/portal';
import {SMPortalModule} from '../portal/portal.module';
import {TableModule} from 'primeng/table';
import {ContextMenuModule} from 'primeng/contextmenu';
import {ClickPreventDefaultDirective} from './directives/click-prevent-default.directive';
import {TagComponent} from './indicators/tag/tag.component';
import {UniqueNameValidatorDirective} from './template-forms-ui/unique-name-validator.directive';
import {ForceInvalidValidatorDirective} from './template-forms-ui/force-invalid-validator.directive';
import {SelectableGroupedFilterListComponent} from './data/selectable-grouped-filter-list/selectable-grouped-filter-list.component';
import {GroupedSelectableListComponent} from './data/grouped-selectable-list/grouped-selectable-list.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {SnippetErrorComponent} from './indicators/snippet-error/snippet-error.component';
import {UpdateNotifierComponent} from './overlay/update-notifier/update-notifier.component';
import {SelectAutocompleteForTemplateFormsComponent} from './inputs/select-autocomplete-for-template-forms/select-autocomplete-for-template-forms.component';
import {UniqueInListValidatorDirective} from './template-forms-ui/unique-in-list-validator.directive';
import {UniqueInListSyncValidatorDirective} from './template-forms-ui/unique-in-list-sync-validator.directive';
import {UniqueInListSync2ValidatorDirective} from './template-forms-ui/unique-in-list-sync-validator-2.directive';
import {MaxNumberValidatorDirective} from './template-forms-ui/max-number-validator.directive';
import {NotAllowedStringsValidatorValidatorDirective} from './template-forms-ui/dont-allow-strings-validator.directive';
import {VerticalLabeledRowComponent} from './data/veritical-labeled-row/vertical-labeled-row.component';
import {RefreshButtonComponent} from '../components/refresh-button/refresh-button.component';
import {DurationInputComponent} from './inputs/duration-input/duration-input.component';
import {CheckedFilterListComponent} from './data/checked-filter-list/checked-filter-list.component';
import {KeydownStopPropagationDirective} from './directives/keydown-stop-propagation.directive';
import {PreventArrowKeysDirective} from './directives/prevent-arrow-keys.directive';
import {EllipsisMiddleDirective} from './directives/ellipsis-middle.directive';
import {UserTagComponent} from './tags/user-tag/user-tag.component';
import {TagListComponent} from './tags/tag-list/tag-list.component';
import {TagsMenuComponent} from './tags/tags-menu/tags-menu.component';
import {TagColorMenuComponent} from './tags/tag-color-menu/tag-color-menu.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {ColorPickerModule} from 'ngx-color-picker';
import {EditJsonComponent} from './overlay/edit-json/edit-json.component';
import {ResizableColumnDirective} from './data/table/resizable-column.directive';
import {JsonValidatorDirective} from './template-forms-ui/json-validator.directive';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {GroupedCheckedFilterListComponent} from './data/grouped-checked-filter-list/grouped-checked-filter-list.component';
import {ShareDialogComponent} from './overlay/share-dialog/share-dialog.component';
import { HesitateDirective } from './directives/hesitate.directive';
import { DividerComponent } from './indicators/divider/divider.component';
import { DurationInputListComponent } from './inputs/duraion-input-list/duration-input-list.component';
import { TableFilterDurationComponent } from './data/table/table-duration-sort-template/table-filter-duration/table-filter-duration.component';
import { TableFilterDurationNumericComponent } from './data/table/table-duration-sort-template/table-filter-duration-numeric/table-filter-duration-numeric.component';
import { TableFilterDurationDateTimeComponent } from './data/table/table-duration-sort-template/table-filter-duration-date-time/table-filter-duration-date-time.component';
import {MatInputModule} from '@angular/material/input';
import {MAT_DATE_LOCALE, MatNativeDateModule} from '@angular/material/core';
import {SelectAutocompleteWithChipsComponent} from './inputs/select-autocomplete-with-chips/select-autocomplete-with-chips.component';
import { TableFilterDurationErrorComponent } from './data/table/table-duration-sort-template/table-filter-duration-error/table-filter-duration-error.component';
import {InvalidPrefixValidatorDirective} from './template-forms-ui/invalid-prefix-validator.directive';
import {UniquePathValidatorDirective} from './template-forms-ui/unique-path-validator.directive';
import {OperationErrorDialogComponent} from '@common/shared/ui-components/overlay/operation-error-dialog/operation-error-dialog.component';
import { CirclesInRowComponent } from './indicators/circles-in-row/circles-in-row.component';
import {RequiredAutocompleteSelectionValidatorDirective} from "@common/shared/ui-components/template-forms-ui/required-autocomplete-selection-validator.directive";
import {OverflowsDirective} from '@common/shared/ui-components/directives/overflows.directive';

const declarations = [
  DurationInputComponent,
  UpdateNotifierComponent,
  SnippetErrorComponent,
  UniqueInListValidatorDirective,
  UniqueInListSyncValidatorDirective,
  UniqueInListSync2ValidatorDirective,
  MaxNumberValidatorDirective,
  SelectAutocompleteForTemplateFormsComponent,
  SelectAutocompleteWithChipsComponent,
  TableComponent,
  TableFilterSortTemplateComponent,
  TableCardFilterTemplateComponent,
  CircleStatusComponent,
  WizardDialogStepComponent,
  LeafComponent,
  ButtonToggleComponent,
  SearchComponent,
  CircleCounterComponent,
  MenuComponent,
  MenuItemComponent,
  CardComponent,
  PlusCardComponent,
  NumberCounterComponent,
  NeonButtonComponent,
  NavbarItemComponent,
  CodeComponent,
  DialogTemplateComponent,
  ConfirmDialogComponent,
  OperationErrorDialogComponent,
  EditJsonComponent,
  ShareDialogComponent,
  ClickStopPropagationDirective,
  EllipsisMiddleDirective,
  KeydownStopPropagationDirective,
  PreventArrowKeysDirective,
  ThrottledScrollListenerDirective,
  JsonValidatorDirective,
  AlertDialogComponent,
  TooltipDirective,
  CheckboxControlComponent,
  SimpleTableComponent2,
  SelectableListComponent,
  CheckedFilterListComponent,
  GroupedCheckedFilterListComponent,
  GroupedSelectableListComponent,
  ClickPreventDefaultDirective,
  SelectableFilterListComponent,
  SelectableGroupedFilterListComponent,
  LabeledRowComponent,
  VerticalLabeledRowComponent,
  CompareFooterComponent,
  IconLabelComponent,
  TableCardComponent,
  ToggleArchiveComponent,
  EditableSectionComponent,
  OverlayComponent,
  ToggleArchiveComponent,
  TermsOfUseDialogComponent,
  LoadingButtonComponent,
  TagComponent,
  UniqueNameValidatorDirective,
  UniquePathValidatorDirective,
  RequiredAutocompleteSelectionValidatorDirective,
  InvalidPrefixValidatorDirective,
  ForceInvalidValidatorDirective,
  NotAllowedStringsValidatorValidatorDirective,
  RefreshButtonComponent,
  UserTagComponent,
  TagListComponent,
  HesitateDirective,
  DividerComponent,
  TableFilterDurationDateTimeComponent,
  TableFilterDurationNumericComponent,
  CirclesInRowComponent,
  OverflowsDirective
];

@NgModule({
  imports     : [
    MatExpansionModule,
    DragDropModule,
    CommonModule,
    ChipsModule,
    FormsModule,
    ReactiveFormsModule,
    ClipboardModule,
    TableModule,
    ContextMenuModule,
    SMMaterialModule,
    MatButtonToggleModule,
    SharedPipesModule,
    ChooseColorModule,
    PortalModule,
    SMPortalModule,
    ScrollingModule,
    ColorPickerModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers   : [],
  declarations: [...declarations, TagsMenuComponent, TagColorMenuComponent, ResizableColumnDirective, HesitateDirective, DurationInputListComponent, TableFilterDurationComponent, TableFilterDurationErrorComponent],
    exports     : [...declarations, ChipsModule, SMMaterialModule, ChooseColorModule, SMPortalModule, TagsMenuComponent, TableFilterDurationComponent, MatDatepickerModule]
})
export class UiComponentsModule {
}
