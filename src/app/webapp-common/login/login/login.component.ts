import {Component, OnDestroy, OnInit, ViewChild, ElementRef} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import {finalize, map, startWith} from 'rxjs/operators';
import {environment} from '../../../../environments/environment';
import {selectCurrentUser} from '../../core/reducers/users-reducer';
import {mobilecheck} from '../../shared/utils/mobile';
import {userPreferences} from '../../user-preferences';
import {FetchCurrentUser, SetPreferences} from '../../core/actions/users.actions';
import {LoginMode, LoginModeEnum, LoginService} from '../../shared/services/login.service';

@Component({
  selector: 'sm-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  loginModel: { name: any; password: any; } = {
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

  constructor(private router: Router, private loginService: LoginService,
    private store: Store<any>, private route: ActivatedRoute) {
    this.mobile = mobilecheck();
  }

  get buttonCaption() {
    return this.loginMode === LoginModeEnum.simple ? 'START' : 'LOGIN';
  }

  ngOnInit() {
    this.store.select(selectCurrentUser).subscribe((res) => {
      if (res) {
        this.router.navigateByUrl(this.getNavigateUrl());
      }
    });

    this.banner = environment.loginBanner;
    this.notice = environment.loginNotice;
    this.demo = environment.demo;
    this.showGitHub = environment.productName === 'trains';
    this.route.queryParams.subscribe((params: Params) => this.redirectUrl = params['redirect']);

    if (this.showGitHub) {
      fetch('https://api.github.com/repos/allegroai/trains', { method: 'GET' })
        .then(response => response.json()
          .then(json => this.stars = json['stargazers_count'])
        );
    }

    this.loginService.getLoginMode().pipe(
      finalize(() => {
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
          this.nameInput.nativeElement.focus();
        }, 500);
      }))
      .subscribe((loginMode: LoginMode) => {
        this.loginMode = loginMode;
      }, () => {
        this.loginMode = LoginModeEnum.simple;
      });

    setTimeout(() => {
      if (!this.loginForm.controls['name']) {
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
  }

  login() {
    if (this.loginMode === LoginModeEnum.password) {
      const user = this.loginModel.name.trim();
      const password = this.loginModel.password.trim();
      this.loginService.passwordLogin(user, password)
        .subscribe((res: any) => {
          this.afterLogin();
        },
        () => this.loginFailed = true);

    } else {
      this.simpleLogin();
    }
  }

  simpleLogin() {
    const user = this.options.find(x => x.name === this.loginModel.name);

    if (user) {
      this.loginService.login(user.id).subscribe((res: any) => {
        this.afterLogin();
      });
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

  acknowlage() {
    this.mobile = false;
  }
}
