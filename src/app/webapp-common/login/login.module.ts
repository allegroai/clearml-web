import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login/login.component';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {NgxFilesizeModule} from 'ngx-filesize';

@NgModule({
  declarations: [LoginComponent],
  providers: [],
    imports: [
        CommonModule,
        LoginRoutingModule,
        FormsModule,
        MatAutocompleteModule,
        HttpClientModule,
        NgxFilesizeModule
    ]
})
export class LoginModule { }
