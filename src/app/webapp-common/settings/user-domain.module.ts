import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SMSharedModule } from '../shared/shared.module';
import { UserDomainEffects } from './user-domain.effect';
import { CommonLayoutModule } from '../layout/layout.module';
import { EffectsModule } from '@ngrx/effects';
import { SharedModule } from '~/shared/shared.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [],
  exports: [],
  imports: [
    CommonModule,
    SMSharedModule,
    EffectsModule.forFeature([UserDomainEffects]),
    CommonLayoutModule,
    SharedModule,
    FormsModule
  ]
})
export class UserDomainModule {
}
