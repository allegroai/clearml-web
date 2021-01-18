import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectRouterConfig} from '../../core/reducers/router-reducer';
import {debounceTime, filter} from 'rxjs/operators';
import {selectBreadcrumbsStrings} from '../layout.reducer';
import {ActivatedRoute} from '@angular/router';
import {combineLatest, Subscription} from 'rxjs';
import {prepareNames} from '../../../layout/breadcrumbs/breadcrumbs.utils';
import {formatStaticCrumb} from './breadcrumbs-common.utils';
import {AddMessage} from '../../core/actions/layout.actions';
import {MESSAGES_SEVERITY} from '../../../app.constants';
import {ConfigurationService} from '../../shared/services/configuration.service';
import {GetCurrentUserResponseUserObjectCompany} from '../../../business-logic/model/users/getCurrentUserResponseUserObjectCompany';


export interface IBreadcrumbsLink {
  name: string;
  url: string;
}

@Component({
  selector: 'sm-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
  public breadcrumbs: Array<IBreadcrumbsLink> = [];
  private routeConfig: Array<string> = [];
  private breadcrumbsStrings;
  private breadcrumbsSubscription: Subscription;
  public currentUrl: string;
  public showShareButton: boolean;
  public isCommunity: boolean;

  @Input() activeWorkspace: GetCurrentUserResponseUserObjectCompany;
  private confSub: Subscription;

  constructor(private store: Store<any>, public route: ActivatedRoute, private configService: ConfigurationService) {
  }

  ngOnInit() {
    this.confSub = this.configService.globalEnvironmentObservable.subscribe(env => this.isCommunity = env.communityServer);
    this.breadcrumbsSubscription = combineLatest([
      this.store.select(selectRouterConfig),
      this.store.select(selectBreadcrumbsStrings)
    ]).pipe(
      debounceTime(10),
      filter(([config, names]) => !!names)
    ).subscribe(([config,  names]) => {
      this.routeConfig = config;
      this.breadcrumbsStrings = prepareNames(names);
      this.refreshBreadcrumbs();
    });
  }

  ngOnDestroy() {
    this.breadcrumbsSubscription.unsubscribe();
    this.confSub?.unsubscribe();
  }

  private refreshBreadcrumbs(): Array<IBreadcrumbsLink> {
    if (!this.routeConfig) {
      return;
    }

    this.breadcrumbs = this.routeConfig
      .reduce((acc, config) => {
        const name = this.getRouteName(config);
        const id = this.getRouteId(config);
        const previous = acc.slice(-1)[0]; // get the last item in the array
        const previousUrl = previous ? previous.url : '';
        return acc.concat({name: name, url: previousUrl + '/' + id});
      }, [{url: '', name: ''}])
      .filter((i) => !!i.name);
    const rootCrumb = formatStaticCrumb(this.routeConfig[0]);
    this.breadcrumbs = [rootCrumb, ...this.breadcrumbs];
    this.showShareButton = !this.routeConfig.includes('login');
  }

  private getRouteName(config: string) {
    return (Object.keys(this.breadcrumbsStrings).includes(config)) ? this.breadcrumbsStrings[config].name : '';
  }

  private getRouteId(config: string) {
    return (Object.keys(this.breadcrumbsStrings).includes(config)) ? this.breadcrumbsStrings[config].url : config;
  }

  openShareModal() {
    this.currentUrl = window.location.href;
  }

  copyToClipboardSuccess() {
    this.store.dispatch(new AddMessage(MESSAGES_SEVERITY.SUCCESS, 'URL copied successfully'));
  }

  checkIfBreadcrumbsInitiated() {
    return this.breadcrumbs && this.routeConfig && this.breadcrumbs.length <= this.routeConfig.length;
  }
}
