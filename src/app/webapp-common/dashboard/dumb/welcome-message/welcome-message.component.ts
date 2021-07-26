import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {setSelectedWorkspaceTab} from '../../../core/actions/users.actions';
import {Subscription} from 'rxjs';
import {selectActiveWorkspace} from '../../../core/reducers/users-reducer';
import {filter, tap} from 'rxjs/operators';
import {Store} from '@ngrx/store';
import {createCredential} from '../../../core/actions/common-auth.actions';
import {selectNewCredential} from '../../../core/reducers/common-auth-reducer';
import {guessAPIServerURL, HTTP} from '../../../../app.constants';
import {AdminService} from '../../../../features/admin/admin.service';
import {ConfigurationService} from '../../../shared/services/configuration.service';
import {GetCurrentUserResponseUserObjectCompany} from '../../../../business-logic/model/users/getCurrentUserResponseUserObjectCompany';
import {Queue} from "../../../../business-logic/model/queues/queue";
import {GettingStartedContext} from '../../../../../environments/base';

type StepObject = { header?: string; title?: string; code?: string; subNote?: string };

@Component({
  selector: 'sm-welcome-message',
  templateUrl: './welcome-message.component.html',
  styleUrls: ['./welcome-message.component.scss']
})
export class WelcomeMessageComponent implements OnInit, OnDestroy {
  public step: number = 1;
  accessKey: string;
  secretKey: string;
  creatingCredentials = false;

  private workspacesSub: Subscription;
  public workspace: GetCurrentUserResponseUserObjectCompany;
  private newCredentialSub: Subscription;

  API_BASE_URL = HTTP.API_BASE_URL_NO_VERSION;
  fileBaseUrl = HTTP.FILE_BASE_URL;
  WEB_SERVER_URL = window.location.origin;
  GETTING_STARTED_STEPS: StepObject[] = [{
    header: 'Get started in a jiffy:',
    title: '1. Install',
    code: 'pip install clearml',
  }, {
    title: '2. Configure',
    code: 'clearml-init'
  }];
  ORPHANED_QUEUE_STEPS: StepObject[] =
    [{
      header: null, code: null,
      subNote: 'See ClearML Documentation for different ways of deploying workers'
    }, {
      header: 'To setup a worker',
      title: '1. Install',
      code: 'pip install clearml-agent',
    }, {
      title: '2. Configure',
      code: 'clearml-agent init'
    }
    ];
  host: string;
  community = false;
  public queue: Queue;
  steps: StepObject[];
  doNotShowAgain: boolean;
  private agentName: string;
  public gettingStartedContext: GettingStartedContext;

  constructor(
    private store: Store<any>,
    private dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data,
    private adminService: AdminService,
    private configService: ConfigurationService
  ) {
    this.dialogRef.beforeClosed().subscribe(() => this.dialogRef.close(this.doNotShowAgain));
    this.step = data?.step || this.step;
    this.queue = data?.queue;
    this.gettingStartedContext = this.configService.getStaticEnvironment().gettingStartedContext;

    this.steps = this.queue ? this.ORPHANED_QUEUE_STEPS : this.GETTING_STARTED_STEPS;
    if (this.queue) {
      this.steps[0].code = `clearml-agent daemon --queue ${this.queue.name}`;
      this.steps[0].header = `To assign a worker to the ${this.queue.name} queue, run:`;
    } else if (this.gettingStartedContext) {
      this.steps[0].code = this.gettingStartedContext.install;
      this.steps[1].code = this.gettingStartedContext.configure;
    }
    this.host = `${window.location.protocol}//${window.location.hostname}`;
    if (this.API_BASE_URL === '/api') {
      this.API_BASE_URL = guessAPIServerURL();
    }

    this.workspacesSub = this.store.select(selectActiveWorkspace)
      .pipe(filter(active => !!active))
      .subscribe(active => this.workspace = active);
  }

  ngOnInit(): void {
    this.community = this.configService.getStaticEnvironment().communityServer;

    this.newCredentialSub = this.store.select(selectNewCredential)
      .pipe(
        tap(() => this.creatingCredentials = false),
        filter(credential => credential && Object.keys(credential).length > 0)
      ).subscribe(credential => {
        this.accessKey = credential.access_key;
        this.secretKey = credential.secret_key;
        this.adminService.resetNewCredential();
      });
  }

  closeDialog() {
    this.dialogRef.close(this.doNotShowAgain);
  }

  nextSteps(event: MouseEvent) {
    event.preventDefault();
    this.step++;
  }

  createCredentials() {
    this.creatingCredentials = true;
    this.store.dispatch(setSelectedWorkspaceTab({workspace: {id: this.workspace.id}}));
    this.store.dispatch(createCredential({workspaceId: this.workspace.id}));
  }

  ngOnDestroy(): void {
    this.workspacesSub?.unsubscribe();
    this.newCredentialSub?.unsubscribe();
  }

  doNotShowThisAgain($event: { field: string; value: any; event: Event }) {
    this.doNotShowAgain = $event.value;
  }
}
