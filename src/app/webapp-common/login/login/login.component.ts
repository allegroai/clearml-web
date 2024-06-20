import {
  Component,
  OnDestroy,
  OnInit,
  ElementRef,
  ChangeDetectorRef,
  Renderer2,
  inject, input, viewChild, effect, signal, computed
} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {EMPTY, Observable, of, Subscription} from 'rxjs';
import {finalize, map, startWith, take, filter, mergeMap, catchError, switchMap} from 'rxjs/operators';
import {fetchCurrentUser, setPreferences} from '../../core/actions/users.actions';
import {LoginMode, loginModes} from '../../shared/services/login.service';
import {selectInviteId} from '../login-reducer';
import {ConfigurationService} from '../../shared/services/configuration.service';
import {ConfirmDialogComponent} from '../../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {LoginService} from '~/shared/services/login.service';
import {UserPreferences} from '../../user-preferences';
import {setBreadcrumbs} from '@common/core/actions/router.actions';
import {CrumbTypeEnum} from '@common/layout/breadcrumbs/breadcrumbs.component';
import {selectCurrentUser} from '@common/core/reducers/users-reducer';


@Component({
  selector: 'sm-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private loginService = inject(LoginService);
  private dialog = inject(MatDialog);
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private userPreferences = inject(UserPreferences);
  private config = inject(ConfigurationService);
  private cdr = inject(ChangeDetectorRef);
  private ref = inject(ElementRef);
  private renderer = inject(Renderer2);

  showSimpleLogin = input<boolean>();
  hideTou = input<boolean>();
  darkTheme = input(true);
  private loginForm = viewChild<NgForm>('loginForm');
  private nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');
  protected environment = this.config.configuration;

  protected showLogin = computed(() => this.showSimpleLogin() || [loginModes.password, loginModes.simple].includes(this.loginMode()));

  protected isInvite = this.router.url.includes('invite');
  loginModel: { name: any; password: any } = {
    name: '',
    password: ''
  };

  options: any[] = [];
  filteredOptions: Observable<any[]>;
  userChanged: Subscription;
  private sub = new Subscription();
  public loginModeEnum = loginModes;

  protected loginFailed = signal(false);
  protected showSpinner = signal<boolean>(null);
  loginMode = signal<LoginMode>(null);
  protected loginTitle = signal<string>(this.isInvite ? '' : 'Login');
  touLink = computed(() => this.environment().legal.TOULink);
  protected notice = computed(() => this.environment().loginNotice);
  protected showGitHub = computed(() => !this.environment().enterpriseServer && !this.environment().communityServer);
  private redirectUrl: string;

  constructor() {
    if (!this.environment().communityServer) {
      this.renderer.addClass(this.ref.nativeElement, 'dark-theme');
    }
    effect(() => {
      this.nameInput()?.nativeElement.focus();
    });
  }

  get buttonCaption() {
    return this.loginMode() === loginModes.simple ? 'START' : 'LOGIN';
  }

  ngOnInit() {
    this.store.dispatch(setBreadcrumbs({
      breadcrumbs: [[{
        name: 'Login',
        type: CrumbTypeEnum.Feature
      }]]}));
    this.store.select(selectCurrentUser)
      .pipe(
        filter(user => !!user),
        take(1)
      )
      .subscribe(() => this.router.navigateByUrl(this.getNavigateUrl()));
    this.store.select(selectInviteId).pipe(
      filter(invite => !!invite),
      take(1),
      mergeMap(inviteId => this.loginService.getInviteInfo(inviteId))
    ).subscribe((inviteInfo: any) => {
      const shorterName = inviteInfo.user_given_name || inviteInfo.user_name?.split(' ')[0];
      this.loginTitle.set(!shorterName ? '' : `Accept ${shorterName ? shorterName + '\'s' : ''} invitation and
      join their team`);
      this.cdr.detectChanges();
    });
    this.route.queryParams
      .pipe(
        filter(params => !!params),
        take(1)
      )
      .subscribe((params: Params) => {
        this.redirectUrl = params['redirect'] || '';
        this.redirectUrl = this.redirectUrl.replace('/login', '/dashboard');
      });

    this.sub.add(this.loginService.getLoginMode().pipe(
      catchError(() => {
        this.loginMode.set(this.config.configuration().onlyPasswordLogin ? loginModes.error : loginModes.simple);
        return EMPTY;
      }),
      finalize(() => {
        if (this.loginMode() === loginModes.simple) {
          this.loginService.getUsers()
            .pipe(take(1))
            .subscribe(users => {
              this.options = users;
              this.cdr.detectChanges();
            });
          if (this.environment().autoLogin && this.redirectUrl && !['/dashboard'].includes(this.redirectUrl)) {
            this.loginForm().controls['name'].setValue((new Date()).getTime().toString());
            this.simpleLogin()
              .pipe(take(1))
              .subscribe();
          }
        }
      }))
      .subscribe((loginMode: LoginMode) => {
        this.loginMode.set(loginMode);
        this.cdr.detectChanges();
      })
    );

    setTimeout(() => {
      if (!this.loginForm()?.controls['name']) {
        return;
      }

      this.filteredOptions = this.loginForm().controls['name'].valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value))
        );

      this.userChanged = this.loginForm().controls['name'].valueChanges
        .subscribe((val: string) => {
          this.loginModel.name = val.trim();
          this.cdr.detectChanges();
        });
    });

  }

  ngOnDestroy() {
    this.userChanged?.unsubscribe();
  }

  login() {
    this.showSpinner.set(true);
    if (this.loginMode() === loginModes.password) {
      const user = this.loginModel.name.trim();
      const password = this.loginModel.password.trim();
      this.loginService.passwordLogin(user, password)
        .pipe(
          catchError(() => {
            this.loginFailed.set(true);
            return EMPTY;
          }),
          take(1),
          switchMap(() => this.afterLogin()),
          finalize( () => this.showSpinner.set(false))
        )
        .subscribe();
    } else {
      this.simpleLogin()
        .pipe(
          take(1),
          catchError(() => EMPTY),
          finalize( () => this.showSpinner.set(false))
        )
        .subscribe();
    }
  }

  simpleLogin() {
    const user = this.options.find(x => x.name === this.loginModel.name);
    if (user) {
      return this.loginService.login(user.id)
        .pipe(
          switchMap(() => this.afterLogin())
        );
    } else {
      const name = this.loginModel.name.trim();
      return this.loginService.autoLogin(name)
        .pipe(
          switchMap(() => this.afterLogin())
        )
    }
  }

  private afterLogin() {
    return this.userPreferences.loadPreferences()
      .pipe(
        take(1),
        catchError(() => this.router.navigateByUrl(this.getNavigateUrl())),
        finalize( () => {
          this.store.dispatch(fetchCurrentUser());
          this.cdr.detectChanges();
        }),
        switchMap(res => {
          this.store.dispatch(setPreferences({payload: res}));
          this.openLoginNotice();
          return of(this.router.navigateByUrl(this.getNavigateUrl()));
        })
      );
      // .subscribe(res => {
      //   this.store.dispatch(setPreferences({payload: res}));
      //   this.router.navigateByUrl(this.getNavigateUrl());
      //   this.openLoginNotice();
      // });
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter((option: any) => option.name.toLowerCase().includes(filterValue.toLowerCase()));
  }

  getNavigateUrl(): string {
    return this.redirectUrl ? this.redirectUrl : '/dashboard';
  }


  private openLoginNotice() {
    if (this.environment().loginPopup) {
      this.dialog.open(ConfirmDialogComponent, {
        disableClose: true,
        data: {
          body: this.environment().loginPopup,
          yes: 'OK',
          iconClass: 'i-alert'
        }
      });
    }
  }
}
