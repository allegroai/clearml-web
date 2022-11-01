import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {setSelectedWorkspaceTab} from '@common/core/actions/users.actions';
import {Subscription} from 'rxjs';
import {selectActiveWorkspace, selectGettingStarted} from '@common/core/reducers/users-reducer';
import {filter} from 'rxjs/operators';
import {Store} from '@ngrx/store';
import {createCredential, resetCredential} from '@common/core/actions/common-auth.actions';
import {selectNewCredential} from '@common/core/reducers/common-auth-reducer';
import {guessAPIServerURL, HTTP} from '~/app.constants';
import {AdminService} from '~/shared/services/admin.service';
import {ConfigurationService} from '@common/shared/services/configuration.service';
import {
  GetCurrentUserResponseUserObjectCompany
} from '~/business-logic/model/users/getCurrentUserResponseUserObjectCompany';
import {Queue} from '~/business-logic/model/queues/queue';
import {GettingStartedContext} from '../../../../environments/base';
import {trackByIndex} from '@common/shared/utils/forms-track-by';


interface StepObject {
  header?: string;
  title?: string;
  code?: string;
  subNote?: string;
}

@Component({
  selector: 'sm-welcome-message',
  templateUrl: './welcome-message.component.html',
  styleUrls: ['./welcome-message.component.scss']
})
export class WelcomeMessageComponent implements OnInit, OnDestroy {
  public step: number = 1;
  accessKey: string;
  secretKey: string;
  credentialsCreated = false;

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
  links = ['Setup ClearML', 'Run your ML code', 'Relaunch previous experiments'];
  host: string;
  community = false;
  public queue: Queue;
  steps: StepObject[];
  doNotShowAgain: boolean;
  public gettingStartedContext: GettingStartedContext;
  docsLink: string;
  credentialsLabel: string;
  public currentLink: string;
  showTabs: boolean;
  public src: string;
  trackByFn = trackByIndex;
  public displayedServerUrls: { apiServer?: string; filesServer?: string };
  private userSubscription: Subscription;
  isJupyter: boolean = false;

  constructor(
    private store: Store<any>,
    private dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data,
    private adminService: AdminService,
    private configService: ConfigurationService,
  ) {
    this.loadYoutubeApi(data?.newExperimentYouTubeVideoId);
    this.dialogRef.beforeClosed().subscribe(() => this.dialogRef.close(this.doNotShowAgain));
    this.step = data?.step || this.step;
    this.queue = data?.queue;
    this.gettingStartedContext = this.configService.getStaticEnvironment().gettingStartedContext;
    this.docsLink = this.configService.getStaticEnvironment().docsLink;
    this.showTabs = data?.showTabs;
    this.currentLink = this.showTabs ? this.links[0] : undefined;
    this.steps = this.queue ? this.ORPHANED_QUEUE_STEPS : this.GETTING_STARTED_STEPS;
    if (this.queue) {
      this.steps[0].code = `clearml-agent daemon --queue ${this.queue.name}`;
      this.steps[0].header = `To assign a worker to the ${this.queue.name} queue, run:`;
    } else if (this.gettingStartedContext) {
      this.steps[0].code = this.gettingStartedContext.install;
      this.steps[1].code = this.gettingStartedContext.configure;
    }
    if (this.showTabs) {
      this.steps[0].header = null;
    }
    this.host = `${window.location.protocol}//${window.location.hostname}`;
    if (this.API_BASE_URL === '/api') {
      this.API_BASE_URL = guessAPIServerURL();
    }

    this.workspacesSub = this.store.select(selectActiveWorkspace)
      .pipe(filter(active => !!active))
      .subscribe(active => this.workspace = active);
    this.userSubscription = this.store.select(selectGettingStarted).subscribe(gettingStarted => {
      this.gettingStartedContext = gettingStarted;
      if (!this.queue) {
        this.steps[0].code = gettingStarted.install;
        this.steps[1].code = gettingStarted.configure;
      } else {
        this.steps[0].code = `clearml-agent daemon --queue ${this.queue.name}`;
        this.steps[0].header = `To assign a worker to the ${this.queue.name} queue, run:`;
        this.steps[1].code = `pip install clearml-agent`;
        this.steps[2].code = `clearml-agent init`;
      }
    });
  }

  ngOnInit(): void {
    this.community = this.configService.getStaticEnvironment().communityServer;
    this.displayedServerUrls = this.configService.getStaticEnvironment().displayedServerUrls;

    this.newCredentialSub = this.store.select(selectNewCredential)
      .pipe(
        filter(credential => credential && Object.keys(credential).length > 0)
      ).subscribe(credential => {
        this.accessKey = credential.access_key;
        this.secretKey = credential.secret_key;
        this.store.dispatch(resetCredential());
        this.setIsJupyter(this.isJupyter);
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
    this.credentialsCreated = true;
    this.store.dispatch(setSelectedWorkspaceTab({workspace: {id: this.workspace.id}}));
    this.store.dispatch(createCredential({workspace: this.workspace, label: this.credentialsLabel}));
  }

  ngOnDestroy(): void {
    this.workspacesSub?.unsubscribe();
    this.newCredentialSub?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

  doNotShowThisAgain($event: { field: string; value: any; event: Event }) {
    this.doNotShowAgain = $event.value;
  }

  showSection(selection: string) {
    this.currentLink = selection;
  }

  loadYoutubeApi(videoId: string) {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
    this.src = videoId;
  }

  setIsJupyter(isJupyter: boolean) {
    this.isJupyter = isJupyter;
    if (isJupyter) {
      this.steps[this.queue ? 2 : 1].code =
        `%env CLEARML_WEB_HOST=${this.WEB_SERVER_URL }
%env CLEARML_API_HOST=${this.displayedServerUrls?.apiServer || this.API_BASE_URL }
%env CLEARML_FILES_HOST=${this.displayedServerUrls?.filesServer || this.fileBaseUrl}${this.credentialsLabel? ('\n# ' + this.credentialsLabel):''}
%env CLEARML_API_ACCESS_KEY=${this.accessKey || `<You’re API access key>`}
%env CLEARML_API_SECRET_KEY=${this.secretKey ||  `<You’re API secret key>`}`;

    } else {
      if (this.queue) {
        this.steps[2].code = `clearml-agent init`;
      } else {
        this.steps[1].code = this.gettingStartedContext.configure;
      }
    }
  }
}
