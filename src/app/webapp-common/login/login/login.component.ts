import {Component, OnDestroy, OnInit, ViewChild, ElementRef, Input} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import {finalize, map, startWith, take, filter, mergeMap} from 'rxjs/operators';
import {selectCurrentUser} from '../../core/reducers/users-reducer';
import {fetchCurrentUser, setPreferences} from '../../core/actions/users.actions';
import {LoginMode, LoginModeEnum} from '../../shared/services/login.service';
import {selectInviteId} from '../login-reducer';
import {ConfigurationService} from '../../shared/services/configuration.service';
import {ConfirmDialogComponent} from '../../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {LoginService} from '~/shared/services/login.service';
import {UserPreferences} from '../../user-preferences';
import {Environment} from '../../../../environments/base';


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
  public loginModeEnum = LoginModeEnum;

  public notice: string;
  public demo: boolean;
  public newUser: boolean;
  public loginFailed = false;
  public showSpinner: boolean;
  public guestUser: { enabled: boolean; username: string; password: string };
  public loginTitle: string;
  public isInvite: boolean;
  public environment: Environment;
  public touLink: string;
  private redirectUrl: string;
  public banner: string;
  public showGitHub: boolean;
  public stars: number = 0;

  @Input() showSimpleLogin: boolean;
  @Input() hideTou: boolean;
  @Input() darkerTou = false;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private dialog: MatDialog,
    private store: Store<any>,
    private route: ActivatedRoute,
    private userPreferences: UserPreferences,
    private config: ConfigurationService
  ) {
    this.environment = config.getStaticEnvironment();
  }

  get buttonCaption() {
    return this.loginMode === LoginModeEnum.simple ? 'START' : 'LOGIN';
  }

  ngOnInit() {
    this.store.select(selectCurrentUser).pipe(filter(user => !!user), take(1)).subscribe(() => this.router.navigateByUrl(this.getNavigateUrl()));
    this.store.select(selectInviteId).pipe(
      filter(invite => !!invite),
      take(1),
      mergeMap(inviteId => this.loginService.getInviteInfo(inviteId))
    ).subscribe((inviteInfo: any) => {
      const shorterName = inviteInfo.user_given_name || inviteInfo.user_name?.split(' ')[0];
      this.loginTitle = !shorterName ? '' : `Accept ${shorterName ? shorterName + '\'s' : ''} invitation and
      join their team`;
    });
    this.isInvite = this.router.url.includes('invite');
    this.notice = this.environment.loginNotice;
    this.loginTitle = this.isInvite ? '' : 'Login'; // NEED SIGNUPMODE
    this.demo = this.environment.demo;
    this.touLink = this.environment.legal.TOULink;
    this.route.queryParams
      .pipe(filter(params => !!params), take(1))
      .subscribe((params: Params) => {
        this.redirectUrl = params['redirect'] || '';
        this.redirectUrl = this.redirectUrl.replace('/login', '/dashboard');
      });

    this.loginService.getLoginMode().pipe(
      finalize(() => {
        this.guestUser = this.loginService.guestUser;
        if (this.loginMode === LoginModeEnum.simple) {
          this.loginService.getUsers().subscribe(users => {
            this.options = users;
          });
          if (this.environment.autoLogin && this.redirectUrl &&
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

    this.banner = this.environment.loginBanner;
    this.showGitHub = !this.environment.enterpriseServer;

    if (this.showGitHub) {
      fetch('https://api.github.com/repos/allegroai/clearml', {method: 'GET'})
        .then(response => response.json()
          .then(json => this.stars = json['stargazers_count'])
        );
    }
  }

  ngOnDestroy() {
    this.userChanged?.unsubscribe();
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
      loginObserver.subscribe(() => {
        this.afterLogin();
      });
      return loginObserver;
    } else {
      const name = this.loginModel.name.trim();
      this.loginService.autoLogin(name, () => this.afterLogin());
    }
  }

  private afterLogin() {
    this.userPreferences.loadPreferences()
      .pipe(
        finalize( () => this.store.dispatch(fetchCurrentUser()))
      )
      .subscribe(res => {
        this.store.dispatch(setPreferences({payload: res}));
        this.router.navigateByUrl(this.getNavigateUrl());
        this.openLoginNotice();
      }, () => this.router.navigateByUrl(this.getNavigateUrl()));
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter((option: any) => option.name.toLowerCase().includes(filterValue.toLowerCase()));
  }

  getNavigateUrl(): string {
    return this.redirectUrl ? this.redirectUrl : '/dashboard';
  }


  private openLoginNotice() {
    if (this.environment.loginPopup) {
      this.dialog.open(ConfirmDialogComponent, {
        disableClose: true,
        data: {
          body: this.environment.loginPopup,
          yes: 'OK',
          iconClass: 'i-alert'
        }
      });
    }
  }
}
