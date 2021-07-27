import {Component, OnDestroy, OnInit, ChangeDetectorRef, ViewChild, AfterViewInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import {take, filter, withLatestFrom} from 'rxjs/operators';
import {userPreferences} from '../../user-preferences';
import {fetchCurrentUser, setPreferences} from '../../core/actions/users.actions';
import {LoginService} from '../../shared/services/login.service';
import {selectCrmForm, selectLoginError, selectTerms, selectUserInfo} from '../login-reducer';
import {MatDialog} from '@angular/material/dialog';
import {ErrorService} from '../../shared/services/error.service';
import {getTOU} from '../login.actions';
import {ConfigurationService} from '../../shared/services/configuration.service';
import {CommunityContext} from '../../../../environments/base';
import {NgForm} from '@angular/forms';

const environment = ConfigurationService.globalEnvironment;

export interface LoginModel {
  signup_token: string;
  crm_form_data: {
    form_data: any;
    form_id: string;
    portal_id: string;
  };
  email?: string;
  name?: string;
}

interface Crmdata {
  fields: {
    'defaultValue': string;
    'description': string;
    'displayOrder': number;
    'enabled': boolean;
    'fieldType': 'text' | 'checkbox' | 'booleancheckbox' | 'select';
    'groupName': string;
    'hidden': boolean;
    'isSmartField': boolean;
    'label': string;
    'labelHidden': boolean;
    'name': string;
    'options': any[];
    'placeholder': string;
    'required': boolean;
    'selectedOptions': any[];
    'type': 'string' | 'enumeration';
    'unselectedLabel': string;
  }[];
}

@Component({
  selector: 'sm-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, AfterViewInit, OnDestroy {

  loginModel: any = {crm_form_data: {}};
  filteredOptions: Observable<any[]>;
  userChanged: Subscription;

  public loginFailed = false;
  public showGitHub: boolean;
  stars: number = 0;
  showSpinner: boolean;
  public guestUser: { enabled: boolean; username: string; password: string };
  public communityContext: CommunityContext;
  public error: string;
  public lockedEmail: boolean;
  public terms: string;
  public crmData: Crmdata[];
  public signupToken: string;
  private formId: string;
  private portalId: string;
  public touLink: string;

  @ViewChild('loginForm') loginForm: NgForm;

  constructor(
    private router: Router, private loginService: LoginService,
    private store: Store<any>, private route: ActivatedRoute,
    private errorSvc: ErrorService, private matDialog: MatDialog,
    private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.store.dispatch(getTOU());
    this.store.select(selectTerms).pipe(filter(terms => !!terms), take(1)).subscribe((terms) => this.terms = terms);
    this.store.select(selectUserInfo).pipe(
      withLatestFrom(this.store.select(selectLoginError), this.store.select(selectCrmForm)),
      take(1)
    ).subscribe(([userInfo, error, crmForm]) => {
      if (userInfo) {
        this.loginModel.crm_form_data.firstname = userInfo.given_name || '';
        this.loginModel.crm_form_data.lastname = userInfo.family_name || '';
        this.loginModel.crm_form_data.email = userInfo.email || '';
        this.formId = crmForm.guid;
        this.portalId = JSON.stringify(crmForm.portalId);
        this.signupToken = userInfo.signup_token;
        this.lockedEmail = !!userInfo.email;
        this.error = error;
        this.crmData = crmForm?.formFieldGroups;
        this.cd.detectChanges();
      } else {
        this.loginLink();
      }
    });
    this.communityContext = environment.communityContext;
    this.touLink = environment.touLink;
    this.showGitHub = true;

    if (this.showGitHub) {
      fetch('https://api.github.com/repos/allegroai/clearml', {method: 'GET'})
        .then(response => response.json()
          .then(json => this.stars = json['stargazers_count'])
        );
    }
  }

  ngAfterViewInit(): void {
    window.setTimeout(() => {
      this.loginForm.controls['firstname']?.markAsTouched();
      this.loginForm.controls['lastname']?.markAllAsTouched();
      this.loginForm.controls['email']?.markAllAsTouched();
    });
  }

  ngOnDestroy() {
    if (this.userChanged) {
      this.userChanged.unsubscribe();
    }
  }

  login() {
    this.showSpinner = true;
    this.loginService.signup({
      signup_token: this.signupToken,
      email: this.loginModel.crm_form_data.email,
      name: (`${this.loginModel.crm_form_data.firstname || ''} ${this.loginModel.crm_form_data.lastname || ''}`).trim(),
      crm_form_data: {
        form_data: JSON.stringify(this.loginModel.crm_form_data),
        form_id: this.formId,
        portal_id: this.portalId
      }
    } as LoginModel)
      .subscribe(
        () => this.afterLogin(),
        (err) => {
          this.showSpinner = false;
          this.loginFailed = true;
          this.error = this.errorSvc.getErrorMsg(err?.error);
        });
  }

  private afterLogin() {
    this.store.dispatch(fetchCurrentUser());
    userPreferences.loadPreferences().subscribe(res => {
      this.store.dispatch(setPreferences({payload: res}));
    });
  }

  loginLink() {
    this.router.navigate(['/login'], {queryParamsHandling: 'preserve'});
  }
}
