import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {PreloadAllModules, RouteReuseStrategy, RouterModule} from '@angular/router';
import {BusinessLogicModule} from './business-logic/business-logic.module';
import {AppComponent} from './app.component';
import {routes} from './app.routes';
import {SMCoreModule} from './core/core.module';
import {SMSharedModule} from './webapp-common/shared/shared.module';
import {FormsModule} from '@angular/forms';
import {CommonLayoutModule} from './webapp-common/layout/layout.module';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {WebappIntercptor} from './webapp-common/core/interceptors/webapp-interceptor';
import {CustomReuseStrategy} from './webapp-common/core/router-reuse-strategy';
import {ApiUsersService} from './business-logic/api-services/users.service';
import {loadUserAndPreferences} from './webapp-common/user-preferences';
import {AdminModule} from './webapp-common/admin/admin.module';
import {AngularSplitModule} from 'angular-split';
import {NotifierModule} from 'angular-notifier';
import {LayoutModule} from './layout/layout.module';
import {ColorHashService} from './webapp-common/shared/services/color-hash/color-hash.service';
import {LoginModule} from './webapp-common/login/login.module';
import {LoginService} from './webapp-common/shared/services/login.service';
import {Store} from '@ngrx/store';
import {TitleCasePipe} from '@angular/common';

@NgModule({
  declarations   : [AppComponent],
  imports        : [
    FormsModule,
    BrowserAnimationsModule,
    BrowserModule,
    SMCoreModule,
    BusinessLogicModule,
    SMSharedModule,
    LoginModule,
    AngularSplitModule.forRoot(),
    RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules, scrollPositionRestoration: 'top', onSameUrlNavigation: 'reload'}),
    AdminModule,
    NotifierModule.withConfig({
      theme    : 'material',
      behaviour: {
        autoHide: {default: 5000, error: false}
      },
      position : {
        vertical  : {position: 'top', distance: 12, gap: 10},
        horizontal: {position: 'right', distance: 12}
      }
    }),
    CommonLayoutModule,
    LayoutModule,
  ],
  providers      : [
    {
      provide   : APP_INITIALIZER,
      useFactory: loadUserAndPreferences,
      multi     : true,
      deps      : [ApiUsersService, LoginService, Store]
    },
    ColorHashService,
    {provide: HTTP_INTERCEPTORS, useClass: WebappIntercptor, multi: true},
    {provide: RouteReuseStrategy, useClass: CustomReuseStrategy},
  ],
  bootstrap      : [AppComponent],
  exports        : []
})

export class AppModule {

  constructor() {

    // store.select(selectRouter)
    // // .filter(state => !state.skipNextNavigation)
    //   .subscribe(state => {
    //     this.store.dispatch(new ResetDontShowAgainForBucketEndpoint());
    //     (!state.params || !state.url) ?
    //       this.router.navigateByUrl(state.url, { queryParams: { unGuard: state.unGuard } }) :
    //       this.router.navigate([state.url, state.params], { queryParams: { unGuard: state.unGuard } });
    //   });

  }

}
