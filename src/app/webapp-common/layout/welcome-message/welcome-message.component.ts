import {LocationStrategy} from '@angular/common';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {setSelectedWorkspaceTab} from '@common/core/actions/users.actions';
import {selectActiveWorkspace, selectGettingStarted} from '@common/core/reducers/users-reducer';
import {filter} from 'rxjs/operators';
import {Store} from '@ngrx/store';
import {createCredential, resetCredential} from '@common/core/actions/common-auth.actions';
import {selectNewCredential} from '@common/core/reducers/common-auth-reducer';
import {ConfigurationService} from '@common/shared/services/configuration.service';
import {
  GetCurrentUserResponseUserObjectCompany
} from '~/business-logic/model/users/getCurrentUserResponseUserObjectCompany';
import {Queue} from '~/business-logic/model/queues/queue';
import {GettingStartedContext} from '../../../../environments/base';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DialogTemplateComponent} from '@common/shared/ui-components/overlay/dialog-template/dialog-template.component';
import {NavbarItemComponent} from '@common/shared/ui-components/panel/navbar-item/navbar-item.component';
import {CopyClipboardComponent} from '@common/shared/ui-components/indicators/copy-clipboard/copy-clipboard.component';
import {YouTubePlayerModule} from '@angular/youtube-player';
import {CheckboxControlComponent} from '@common/shared/ui-components/forms/checkbox-control/checkbox-control.component';


interface StepObject {
  id: number;
  header?: string;
  title?: string;
  code?: string;
  subNote?: string;
}

export interface WelcomeMessageData {
  queue: Queue;
  entityName: string;
  step: number;
  showTabs?: boolean;
  newExperimentYouTubeVideoId?: string;
}


@Component({
  selector: 'sm-welcome-message',
  templateUrl: './welcome-message.component.html',
  styleUrls: ['./welcome-message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    DialogTemplateComponent,
    NavbarItemComponent,
    CopyClipboardComponent,
    YouTubePlayerModule,
    CheckboxControlComponent
  ]
})
export class WelcomeMessageComponent {
  public step: number = 1;
  accessKey: string;
  secretKey: string;
  credentialsCreated = false;

  public workspace: GetCurrentUserResponseUserObjectCompany;


  WEB_SERVER_URL = window.location.origin + this.locationStrategy.getBaseHref();
  GETTING_STARTED_STEPS: StepObject[] = [{
    id: 1,
    header: 'Get started in a jiffy:',
    title: '1. Install',
    code: 'pip install clearml',
  }, {
    id: 2,
    title: '2. Configure',
    code: 'clearml-init'
  }];
  ORPHANED_QUEUE_STEPS: StepObject[] =
    [{
      id: 1,
      header: null, code: null,
      subNote: 'See ClearML Documentation for different ways of deploying workers'
    }, {
      id: 2,
      header: 'To setup a worker',
      title: '1. Install',
      code: 'pip install clearml-agent',
    }, {
      id: 3,
      title: '2. Configure',
      code: 'clearml-agent init'
    }
    ];
  public links = ['Set up ClearML', 'Run your ML code', 'Relaunch previous experiments'];
  public host: string;
  public queue: Queue;
  public steps: StepObject[];
  public doNotShowAgain: boolean;
  public gettingStartedContext: GettingStartedContext;
  public docsLink: string;
  public credentialsLabel: string;
  public currentLink: string;
  public showTabs: boolean;
  public src: string;
  public isJupyter: boolean = false;
  public community: boolean;
  public entityName: string;
  credentialsComment: string;

  constructor(
    private store: Store,
    private dialogRef: MatDialogRef<WelcomeMessageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WelcomeMessageData,
    protected configService: ConfigurationService,
    private cdr: ChangeDetectorRef,
    private locationStrategy: LocationStrategy
  ) {
    this.dialogRef.beforeClosed().subscribe(res =>
      this.doNotShowAgain && !res? this.dialogRef.close(this.doNotShowAgain) : false);

    this.loadYoutubeApi(data?.newExperimentYouTubeVideoId);
    this.step = data?.step || this.step;
    this.queue = data?.queue;
    this.entityName = data?.entityName ?? 'Tasks';

    this.configService.getEnvironment()
      .pipe(takeUntilDestroyed())
      .subscribe(env => {
        this.gettingStartedContext = env.gettingStartedContext;
        this.docsLink = env.docsLink;
        this.community = env.communityServer;
        this.cdr.markForCheck();
      });
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

    this.store.select(selectActiveWorkspace)
      .pipe(
        takeUntilDestroyed(),
        filter(active => !!active)
      )
      .subscribe(active => {
        this.workspace = active;
        this.credentialsComment = this.community && this.workspace.name
        this.cdr.markForCheck();
      });

    this.store.select(selectGettingStarted)
      .pipe(takeUntilDestroyed())
      .subscribe(gettingStarted => {
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
        this.cdr.markForCheck();
      });

    this.store.select(selectNewCredential)
      .pipe(
        takeUntilDestroyed(),
        filter(credential => credential && Object.keys(credential).length > 0)
      )
      .subscribe(credential => {
        this.accessKey = credential.access_key;
        this.secretKey = credential.secret_key;
        this.store.dispatch(resetCredential());
        this.setIsJupyter(this.isJupyter);
        this.cdr.markForCheck();
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

  doNotShowThisAgain($event: { field: string; value: boolean; event: Event }) {
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
        `%env CLEARML_WEB_HOST=${this.WEB_SERVER_URL}
%env CLEARML_API_HOST=${this.configService.apiServerUrl()}\n`;
      if (this.configService.fileServerUrl()) {
       this.steps[this.queue ? 2 : 1].code += `%env CLEARML_FILES_HOST=${this.configService.fileServerUrl()}\n`;
      }
      if(this.credentialsLabel) {
        this.steps[this.queue ? 2 : 1].code += `# ${this.credentialsLabel}\n`;
      }
      this.steps[this.queue ? 2 : 1].code += `%env CLEARML_API_ACCESS_KEY=${this.accessKey || '<Your API access key>'}
%env CLEARML_API_SECRET_KEY=${this.secretKey ||  '<Your API secret key>'}`;
    } else {
      if (this.queue) {
        this.steps[2].code = `clearml-agent init`;
      } else {
        this.steps[1].code = this.gettingStartedContext.configure;
      }
    }
  }

  getCopyConfig() {
    let res =  'api {\n';
    if (this.credentialsComment) {
      res += `  # ${this.credentialsComment}\n`;
    }
    res += `  web_server: ${this.WEB_SERVER_URL}
  api_server: ${this.configService.apiServerUrl()}\n`;
    const filesServer = this.configService.fileServerUrl();
    if (filesServer) {
      res += `  files_server: ${filesServer}\n`;
    }
    res += `  credentials {
    "access_key" = "${this.accessKey}"
    "secret_key" = "${this.secretKey}"
  }
}`;
    return res;
  }

  getCopyPython() {
    if(this.showTabs) {
      return `import numpy as np
import matplotlib.pyplot as plt
# Add the following two lines to your code, to have ClearML automatically log your experiment
from ${this.gettingStartedContext?.packageName || 'clearml'} import Task

task = Task.init(project_name='My Project', task_name='My Experiment')
# Create a plot using matplotlib, or you can also use plotly
plt.scatter(np.random.rand(50), np.random.rand(50), c=np.random.rand(50), alpha=0.5)
# Plot will be reported automatically to clearml
plt.show()

# Report some scalars
for i in range(100):
  task.get_logger().report_scalar(title="graph title", series="linear", value=i*2, iteration=i)`;
    }
    return `from ${this.gettingStartedContext?.packageName || 'clearml'} import Task
task = Task.init(project_name="my project", task_name="my task")`;
  }
}
