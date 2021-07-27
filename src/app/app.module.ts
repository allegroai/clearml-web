import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {PreloadAllModules, RouteReuseStrategy, RouterModule} from '@angular/router';
import {BusinessLogicModule} from './business-logic/business-logic.module';
import {AppComponent} from './app.component';
import {routes} from './app.routes';
import {SMCoreModule} from './core/core.module';
import {SMSharedModule} from '@common/shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonLayoutModule} from '@common/layout/layout.module';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {WebappInterceptor} from '@common/core/interceptors/webapp-interceptor';
import {CustomReuseStrategy} from '@common/core/router-reuse-strategy';
import {ApiUsersService} from './business-logic/api-services/users.service';
import {loadUserAndPreferences} from '@common/user-preferences';
import {AdminModule} from '@common/admin/admin.module';
import {AngularSplitModule} from 'angular-split';
import {NotifierModule} from '@common/angular-notifier';
import {LayoutModule} from './layout/layout.module';
import {ColorHashService} from '@common/shared/services/color-hash/color-hash.service';
import {LoginService} from '@common/shared/services/login.service';
import {Store} from '@ngrx/store';
import {SharedModule} from './shared/shared.module';
import {ErrorService} from '@common/shared/services/error.service';
import {ConfigurationService} from '@common/shared/services/configuration.service';
import {ProjectsSharedModule} from './features/projects/shared/projects-shared.module';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';

@NgModule({
  declarations   : [AppComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ProjectsSharedModule,
    BrowserModule,
    SMCoreModule,
    BusinessLogicModule,
    SMSharedModule,
    AngularSplitModule,
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      scrollPositionRestoration: 'top',
      onSameUrlNavigation: 'reload',
      relativeLinkResolution: 'legacy'
}),
    AdminModule,
    NotifierModule.withConfig({
      theme: 'material',
      behaviour: {
        autoHide: {default: 5000, error: false}
      },
      position: {
        vertical: {position: 'top', distance: 12, gap: 10},
        horizontal: {position: 'right', distance: 12}
      }
    }),
    CommonLayoutModule,
    LayoutModule,
    SharedModule,
  ],
  providers      : [
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {floatLabel: 'always'}},
    {
      provide   : APP_INITIALIZER,
      useFactory: loadUserAndPreferences,
      multi     : true,
      deps      : [ApiUsersService, LoginService, Store, ErrorService, ConfigurationService]
    },
    ColorHashService,
    {provide: HTTP_INTERCEPTORS, useClass: WebappInterceptor, multi: true},
    {provide: RouteReuseStrategy, useClass: CustomReuseStrategy},
    {
      provide: 'googleTagManagerId',
      deps: [ConfigurationService],
      useFactory: (confService: ConfigurationService) =>
        confService.getStaticEnvironment().GTM_ID
    }
  ],
  bootstrap      : [AppComponent],
  exports        : []
})
export class AppModule {}
