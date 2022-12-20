import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {addMessage} from '@common/core/actions/layout.actions';
import {LocationStrategy} from '@angular/common';
import {v4} from 'uuid';
import {MESSAGES_SEVERITY} from '@common/constants';
import {selectActiveWorkspace} from '@common/core/reducers/users-reducer';
import {GetCurrentUserResponseUserObjectCompany} from '~/business-logic/model/users/getCurrentUserResponseUserObjectCompany';
import {ConfigurationService} from '@common/shared/services/configuration.service';
import {ClipboardService} from 'ngx-clipboard';
import { take } from 'rxjs';

interface ReportCodeEmbedConfiguration {
  type: 'plot' | 'multiplot' | 'scalar' | 'multiscalar' | 'sample';
  tasks: string[];
  name?: string;
  metrics?: string[];
  variants?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportCodeEmbedService {
  private workspace: GetCurrentUserResponseUserObjectCompany;
  private isCommunity: boolean;

  constructor(
    private store: Store,
    private locationStrategy: LocationStrategy,
    private configService: ConfigurationService,
    private _clipboardService: ClipboardService
  ) {
    this.isCommunity = this.configService.getStaticEnvironment().communityServer;
    this.store.select(selectActiveWorkspace).subscribe(workspace => this.workspace = workspace);
  }

  createCode(conf: ReportCodeEmbedConfiguration) {
    const code = this.encode(conf);
    this._clipboardService.copyResponse$
      .pipe(take(1))
      .subscribe(() => this.store.dispatch(addMessage(MESSAGES_SEVERITY.SUCCESS,
        'Resource embed code copied to clipboard.You can paste in your Reports.'))
      );
    this._clipboardService.copy(code);
  }

  encode(conf: ReportCodeEmbedConfiguration) {
    const url = new URL(window.location.origin + this.locationStrategy.getBaseHref());
    url.pathname = url.pathname + 'widgets/';
    url.searchParams.set('type', conf.type);
    let urlStr = url.toString();
    ['tasks', 'metrics', 'variants'].forEach(key => {
      if (conf[key]?.filter(v => !!v).length > 0) {
        urlStr += '&' + conf[key].map(val => `${key}=${encodeURIComponent(val)}`).join('&');
      }
    });
    if (this.configService && this.workspace?.id) {
        urlStr += `&company=${this.workspace.id}`;
    }
    return `<iframe
  src="${urlStr}"
  name="${conf.name || v4()}"
  width="100%" height="400"
></iframe>`;
  }
}
