import {Component, OnDestroy, OnInit, ViewChild, ElementRef} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import {finalize, map, startWith, take, filter, mergeMap} from 'rxjs/operators';
import {selectCurrentUser} from '../../core/reducers/users-reducer';
import {mobilecheck} from '../../shared/utils/mobile';
import {userPreferences} from '../../user-preferences';
import {FetchCurrentUser, SetPreferences} from '../../core/actions/users.actions';
import {LoginMode, LoginModeEnum, LoginService} from '../../shared/services/login.service';
import {selectInviteId, selectLoginError} from '../login-reducer';
import {ConfigurationService} from '../../shared/services/configuration.service';
import {setLoginError} from '../login.actions';
import {CommunityContext} from '../../../../environments/base';
const environment = ConfigurationService.globalEnvironment;


@Component({
  selector: 'sm-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  loginModel: { name: any; password: any } = {
    name: '',
    password: ''
  };

  @ViewChild('loginForm', {static: true}) loginForm: NgForm;
  @ViewChild('nameInput', {static: true}) nameInput: ElementRef;
  options: any[] = [];
  loginMode: LoginMode;
  filteredOptions: Observable<any[]>;
  userChanged: Subscription;
  public LoginModeEnum = LoginModeEnum;

  public banner: string;
  public notice: string;
  public demo: boolean;
  public mobile: boolean;
  public newUser: boolean;
  public loginFailed = false;
  public showGitHub: boolean;
  private redirectUrl: string;
  stars: number = 0;
  showSpinner: boolean;
  public guestUser: { enabled: boolean; username: string; password: string };
  public ssoEnabled = false;
  public communityContext: CommunityContext;
  public loginTitle: string;
  public error: string;
  public signupMode: boolean = true;
  public signupForm: boolean;
  public isInvite: boolean;
  public environment: any;
  public isCommunity: boolean;
  public sso: { name: string; url: string }[];
  public touLink: string;

  constructor(
    private router: Router, private loginService: LoginService,
    private store: Store<any>, private route: ActivatedRoute) {
    this.mobile = mobilecheck();
  }

  get buttonCaption() {
    return this.loginMode === LoginModeEnum.simple ? 'START' : 'LOGIN';
  }

  ngOnInit() {
    this.environment = environment;
    this.store.select(selectCurrentUser).pipe(filter(user => !!user), take(1)).subscribe(() => this.router.navigateByUrl(this.getNavigateUrl()));
    this.store.select(selectLoginError).subscribe((error) => this.error = error);
    this.store.select(selectInviteId).pipe(
      filter(invite => !!invite),
      take(1),
      mergeMap(inviteId => this.loginService.getInviteInfo(inviteId))
    ).subscribe((inviteInfo) => {
      const shorterName = inviteInfo.user_given_name || inviteInfo.user_name?.split(' ')[0];
      this.loginTitle = !shorterName? '' : `Accept ${shorterName ? shorterName + '\'s' : ''} invitation and
      join their team`;
    });
    this.removeSignupFromUrl();
    this.isInvite = this.router.url.includes('invite');
    this.banner = environment.loginBanner;
    this.notice = environment.loginNotice;
    this.loginTitle = this.isInvite ? '' : (this.signupMode && this.isCommunity) ? 'Sign up' : 'Login';
    this.communityContext = environment.communityContext;
    this.isCommunity = environment.communityServer;
    this.demo = environment.demo;
    this.showGitHub = environment.productName === 'clearml';
    this.touLink = environment.touLink;
    this.route.queryParams
      .pipe(filter(params => !!params), take(1))
      .subscribe((params: Params) => {
        this.signupForm = this.route.snapshot.routeConfig.path === 'signup';
        this.redirectUrl = params['redirect'] || '';
        this.redirectUrl = this.redirectUrl.replace('/login', '/dashboard');
      });

    if (this.showGitHub) {
      fetch('https://api.github.com/repos/allegroai/trains', {method: 'GET'})
        .then(response => response.json()
          .then(json => this.stars = json['stargazers_count'])
        );
    }

    this.loginService.getLoginMode().pipe(
      finalize(() => {
        this.guestUser = this.loginService.guestUser;
        this.sso = this.loginService.sso;
        this.ssoEnabled = this.sso.length > 0;
        if (this.loginMode === LoginModeEnum.simple) {
          this.loginService.getUsers().subscribe(users => {
            this.options = users;
          });
          if (environment.autoLogin && this.redirectUrl &&
            !['/dashboard'].includes(this.redirectUrl)) {
            this.loginForm.controls['name'].setValue((new Date()).getTime().toString());
            this.simpleLogin();
          }
        }
        setTimeout(() => {
          this.nameInput?.nativeElement.focus();
        }, 500);
      }))
      .subscribe((loginMode: LoginMode) => {
        this.loginMode = loginMode;
      }, () => {
        this.loginMode = LoginModeEnum.simple;
      });

    setTimeout(() => {
      if (!this.loginForm?.controls['name']) {
        return;
      }

      this.filteredOptions = this.loginForm.controls['name'].valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value))
        );

      this.userChanged = this.loginForm.controls['name'].valueChanges
        .subscribe((val: string) => {
          this.loginModel.name = val.trim();
          const user = this.options.find(x => x.name === val);
          this.newUser = this.loginMode === LoginModeEnum.simple && !user;
        });
    });
  }

  ngOnDestroy() {
    if (this.userChanged) {
      this.userChanged.unsubscribe();
    }
    this.removeSignupFromUrl();
  }

  login() {
    this.showSpinner = true;
    if (this.loginMode === LoginModeEnum.password) {
      const user = this.loginModel.name.trim();
      const password = this.loginModel.password.trim();
      this.loginService.passwordLogin(user, password)
        .subscribe(
          () => this.afterLogin(),
          () => {
            this.showSpinner = false;
            this.loginFailed = true;
          });
    } else {
      const observer = this.simpleLogin();
      observer?.subscribe(
        () => this.showSpinner = false,
        () => this.showSpinner = false
      );
    }
  }

  simpleLogin() {
    const user = this.options.find(x => x.name === this.loginModel.name);

    if (user) {
      const loginObserver = this.loginService.login(user.id);
      loginObserver.subscribe((res: any) => {
        this.afterLogin();
      });
      return loginObserver;
    } else {
      const name = this.loginModel.name.trim();
      this.loginService.autoLogin(name, () => this.afterLogin());
    }
  }

  private afterLogin() {
    let domainParts = window.location.host.split(':')[0].split('.');
    if (domainParts.length > 2) {
      domainParts = domainParts.slice(1);
    }
    this.store.dispatch(new FetchCurrentUser());
    userPreferences.loadPreferences().subscribe(res => {
      this.store.dispatch(new SetPreferences(res));
      this.router.navigateByUrl(this.getNavigateUrl());
    }, () => this.router.navigateByUrl(this.getNavigateUrl()));
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter((option: any) => option.name.toLowerCase().includes(filterValue.toLowerCase()));
  }

  getNavigateUrl(): string {
    return this.redirectUrl ? this.redirectUrl : '/dashboard';
  }

  acknowledge() {
    this.mobile = false;
  }

  loginGuest() {
    this.showSpinner = true;
    this.loginService.passwordLogin(this.guestUser.username, this.guestUser.password)
      .subscribe((res: any) => {
          this.afterLogin();
        },
        () => {
          this.showSpinner = false;
          this.loginFailed = true;
        });
  }

  ssoLogin(providerUrl: string) {
    window.location.href = providerUrl;
  }

  toggleSignup() {
    this.showSpinner = true;
    this.signupMode = !this.signupMode;
    this.removeSignupFromUrl();
    if (!this.isInvite) {
      this.loginTitle = this.signupMode ? 'Signup' : 'Login';
    }
    this.store.dispatch(setLoginError({error: null}));
    this.loginService.getLoginSupportedModes(this.signupMode ? 'signup' : '').subscribe(res => {
      this.showSpinner = false;
      this.sso = res.sso_providers;
    });

  }

  private removeSignupFromUrl() {
    if (this.router.url.includes('redirect') && this.route.snapshot.queryParams.redirect.includes('signup')) {
      this.router.navigate(
        [],
        {
          relativeTo: this.route,
          queryParams: {redirect: this.route.snapshot.queryParams.redirect?.replace(/[&]?signup/, '')},
          queryParamsHandling: 'merge'
        });
    }
  }
}
