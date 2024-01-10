import {InjectionToken, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EffectsModule} from '@ngrx/effects';
import {CommonLayoutModule} from '../layout/layout.module';
import {SharedModule} from '~/shared/shared.module';
import {ReportsEffects} from './reports.effects';
import {ReportsPageComponent} from './reports-page/reports-page.component';
import {ActionReducer, StoreConfig, StoreModule} from '@ngrx/store';
import {REPORTS_KEY, reportsReducer, ReportsState} from './reports.reducer';
import {ReportsRoutingModule} from './reports-routing.module';
import {ReportsListComponent} from './reports-list/reports-list.component';
import {ReportsHeaderComponent} from './reports-filters/reports-header.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ReportDialogComponent} from './report-dialog/report-dialog.component';
import {CreateNewReportFormComponent} from './report-dialog/create-new-report-form/create-new-report-form.component';
import {ReportComponent} from './report/report.component';
import {NgxPrintModule} from 'ngx-print';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {ReportsSharedModule} from '@common/reports/reports-shared.module';
import {ExistNameValidatorDirective} from '@common/shared/ui-components/template-forms-ui/exist-name-validator.directive';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';
import {UserPreferences} from '@common/user-preferences';
import {createUserPrefFeatureReducer} from '@common/core/meta-reducers/user-pref-reducer';
import {REPORTS_PREFIX} from '@common/reports/reports.actions';
import {SearchTextDirective} from '@common/shared/ui-components/directives/searchText.directive';
import {
  UniqueNameValidatorDirective
} from '@common/shared/ui-components/template-forms-ui/unique-name-validator.directive';
import {MenuItemComponent} from '@common/shared/ui-components/panel/menu-item/menu-item.component';
import {TagsMenuComponent} from '@common/shared/ui-components/tags/tags-menu/tags-menu.component';
import {MenuComponent} from '@common/shared/ui-components/panel/menu/menu.component';
import {
  MainPagesHeaderFilterComponent
} from '@common/shared/components/main-pages-header-filter/main-pages-header-filter.component';
import {MarkdownEditorComponent} from '@common/shared/components/markdown-editor/markdown-editor.component';
import {SearchComponent} from '@common/shared/ui-components/inputs/search/search.component';
import {TagListComponent} from '@common/shared/ui-components/tags/tag-list/tag-list.component';
import {DialogTemplateComponent} from '@common/shared/ui-components/overlay/dialog-template/dialog-template.component';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {ButtonToggleComponent} from '@common/shared/ui-components/inputs/button-toggle/button-toggle.component';
import {ToggleArchiveComponent} from '@common/shared/ui-components/buttons/toggle-archive/toggle-archive.component';
import {MatMenuModule} from '@angular/material/menu';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {ScrollEndDirective} from '@common/shared/ui-components/directives/scroll-end.directive';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {ShowTooltipIfEllipsisDirective} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';


const reportsSyncedKeys = ['orderBy', 'sortOrder'];
export const REPORTS_STORE_CONFIG_TOKEN =
  new InjectionToken<StoreConfig<ReportsState, any>>('DatasetsConfigToken');

const getInitState = (userPreferences: UserPreferences) => ({
  metaReducers: [
    (reducer: ActionReducer<any>) =>
      createUserPrefFeatureReducer(REPORTS_KEY, reportsSyncedKeys, [REPORTS_PREFIX], userPreferences, reducer),
  ]
});
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EffectsModule.forFeature([ReportsEffects]),
    StoreModule.forFeature(REPORTS_KEY, reportsReducer, REPORTS_STORE_CONFIG_TOKEN),
    SharedModule,
    CommonLayoutModule,
    ReportsRoutingModule,
    NgxPrintModule,
    ScrollingModule,
    ReportsSharedModule,
    ExistNameValidatorDirective,
    MatProgressSpinnerModule,
    LabeledFormFieldDirective,
    SearchTextDirective,
    UniqueNameValidatorDirective,
    MenuItemComponent,
    TagsMenuComponent,
    MenuComponent,
    MainPagesHeaderFilterComponent,
    MarkdownEditorComponent,
    SearchComponent,
    TagListComponent,
    DialogTemplateComponent,
    TooltipDirective,
    ButtonToggleComponent,
    ToggleArchiveComponent,
    MatMenuModule,
    MatSidenavModule,
    MatInputModule,
    MatAutocompleteModule,
    ScrollEndDirective,
    ClickStopPropagationDirective,
    ShowTooltipIfEllipsisDirective
  ],
  declarations: [ReportsPageComponent, ReportsListComponent, ReportsHeaderComponent, ReportDialogComponent,
    CreateNewReportFormComponent, ReportComponent],
  exports: [],
  providers: [
    {provide: REPORTS_STORE_CONFIG_TOKEN, useFactory: getInitState, deps: [UserPreferences]},
  ],
})
export class ReportsModule {
}
