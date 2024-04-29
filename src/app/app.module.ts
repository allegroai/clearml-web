import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {PreloadAllModules, RouteReuseStrategy, RouterModule} from '@angular/router';
import {BusinessLogicModule} from './business-logic/business-logic.module';
import {AppComponent} from './app.component';
import {routes} from './app.routes';
import {SMCoreModule} from './core/core.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonLayoutModule} from '@common/layout/layout.module';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {WebappInterceptor} from '@common/core/interceptors/webapp-interceptor';
import {CustomReuseStrategy} from '@common/core/router-reuse-strategy';
import {UserPreferences} from '@common/user-preferences';
import {AngularSplitModule} from 'angular-split';
import {NotifierModule} from '@common/angular-notifier';
import {LayoutModule} from './layout/layout.module';
import {ColorHashService} from '@common/shared/services/color-hash/color-hash.service';
import {SharedModule} from './shared/shared.module';
import {ConfigurationService} from '@common/shared/services/configuration.service';
import {ProjectsSharedModule} from './features/projects/shared/projects-shared.module';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';
import {LoginService} from '~/shared/services/login.service';
import {ExperimentSharedModule} from '~/features/experiments/shared/experiment-shared.module';
import {loadUserAndPreferences} from '~/core/app-init';
import {MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions} from '@angular/material/tooltip';
import {UpdateNotifierComponent} from '@common/shared/ui-components/overlay/update-notifier/update-notifier.component';
import {ChooseColorModule} from '@common/shared/ui-components/directives/choose-color/choose-color.module';
import {SpinnerComponent} from '@common/shared/ui-components/overlay/spinner/spinner.component';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UploadArtifactDialogComponent } from '@common/shared/ui-components/overlay/upload-artifact-dialog/upload-artifact-dialog.component';


@NgModule({
  declarations   : [AppComponent],
  imports: [
    ExperimentSharedModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ProjectsSharedModule,
    BrowserModule,
    SMCoreModule,
    BusinessLogicModule,
    AngularSplitModule,
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      scrollPositionRestoration: 'top',
      onSameUrlNavigation: 'reload'
    }),
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
    UpdateNotifierComponent,
    ChooseColorModule,
    SpinnerComponent,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    UploadArtifactDialogComponent
  ],
  providers      : [
    UserPreferences,
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {floatLabel: 'always'}},
    {
      provide   : APP_INITIALIZER,
      deps: [LoginService, ConfigurationService],
      useFactory: loadUserAndPreferences,
      multi     : true,
    },
    ColorHashService,
    {provide: HTTP_INTERCEPTORS, useClass: WebappInterceptor, multi: true},
    {provide: RouteReuseStrategy, useClass: CustomReuseStrategy},
    {
      provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
      useValue: {position: 'above'} as MatTooltipDefaultOptions
    }
  ],
  bootstrap      : [AppComponent],
  exports        : []
})
export class AppModule {}
