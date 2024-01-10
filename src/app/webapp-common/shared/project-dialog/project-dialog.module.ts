import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {projectDialogReducer} from './project-dialog.reducer';
import {ProjectDialogEffects} from './project-dialog.effects';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ProjectDialogComponent} from './project-dialog.component';
import {CreateNewProjectFormComponent} from './create-new-project-form/create-new-project-form.component';
import {ProjectMoveToFormComponent} from './project-move-to-form/project-move-to-form.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {UniqueProjectValidator} from '@common/shared/project-dialog/unique-project.validator';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';
import {SearchTextDirective} from '@common/shared/ui-components/directives/searchText.directive';
import {StringIncludedInArrayPipe} from '@common/shared/pipes/string-included-in-array.pipe';
import {ShortProjectNamePipe} from '@common/shared/pipes/short-project-name.pipe';
import {ProjectLocationPipe} from '@common/shared/pipes/project-location.pipe';
import {
  UniqueNameValidatorDirective
} from '@common/shared/ui-components/template-forms-ui/unique-name-validator.directive';
import {DialogTemplateComponent} from '@common/shared/ui-components/overlay/dialog-template/dialog-template.component';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {
  UniquePathValidatorDirective
} from '@common/shared/ui-components/template-forms-ui/unique-path-validator.directive';
import {
  InvalidPrefixValidatorDirective
} from '@common/shared/ui-components/template-forms-ui/invalid-prefix-validator.directive';
import {MatOptionModule} from '@angular/material/core';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {ScrollEndDirective} from '@common/shared/ui-components/directives/scroll-end.directive';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {
  ShowTooltipIfEllipsisDirective
} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ShortProjectNamePipe,
    MatProgressSpinnerModule,
    LabeledFormFieldDirective,
    SearchTextDirective,
    StringIncludedInArrayPipe,
    ProjectLocationPipe,
    UniqueNameValidatorDirective,
    StoreModule.forFeature('projectCreateDialog', projectDialogReducer),
    EffectsModule.forFeature([ProjectDialogEffects]),
    DialogTemplateComponent,
    TooltipDirective,
    UniquePathValidatorDirective,
    InvalidPrefixValidatorDirective,
    MatOptionModule,
    MatAutocompleteModule,
    MatInputModule,
    ScrollEndDirective,
    ClickStopPropagationDirective,
    ShowTooltipIfEllipsisDirective,
  ],
  declarations: [ProjectDialogComponent, CreateNewProjectFormComponent, ProjectMoveToFormComponent, UniqueProjectValidator]
})
export class ProjectDialogModule { }
