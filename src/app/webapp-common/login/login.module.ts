import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login/login.component';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {NgxFilesizeModule} from 'ngx-filesize';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {SignupComponent} from './signup/signup.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import { EffectsModule } from '@ngrx/effects';
import { LoginEffects } from './login.effects';
import {MatInputModule} from '@angular/material/input';
import {MatRadioModule} from '@angular/material/radio';
import {SharedPipesModule} from '../shared/pipes/shared-pipes.module';

@NgModule({
  declarations: [LoginComponent, SignupComponent],
  providers: [],
  imports: [
    CommonModule,
    LoginRoutingModule,
    FormsModule,
    MatAutocompleteModule,
    HttpClientModule,
    NgxFilesizeModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    EffectsModule.forFeature([LoginEffects]),
    MatInputModule,
    MatRadioModule,
    SharedPipesModule,
  ]
})
export class LoginModule { }
