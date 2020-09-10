import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SideNavComponent} from './side-nav/side-nav.component';
import {SMSharedModule} from '../webapp-common/shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {SurveyComponent} from './survey/survey.component';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  declarations: [SideNavComponent, SurveyComponent],
  exports: [SideNavComponent, SurveyComponent],
    imports: [
        CommonModule,
        SMSharedModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        SharedModule,
    ]
})
export class LayoutModule { }
