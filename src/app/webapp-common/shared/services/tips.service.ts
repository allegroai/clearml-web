import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Store} from '@ngrx/store';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {selectRouterConfig} from '../../core/reducers/router-reducer';
import {combineLatest, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';
import {TipOfTheDayModalComponent} from '../../layout/tip-of-the-day-modal/tip-of-the-day-modal.component';
import {selectFirstLogin, selectNeverShowPopups} from '../../core/reducers/view-reducer';
import {selectCurrentUser, selectTermsOfUse} from '../../core/reducers/users-reducer';
import {neverShowPopupAgain} from '../../core/actions/layout.actions';
import {GetCurrentUserResponseUserObject} from '../../../business-logic/model/users/getCurrentUserResponseUserObject';

interface Tips {
  [url: string]: Tip[];
}

export interface Tip {
  title: string;
  image: string;
  content: string;
  context: string;
}

const tipsCooldownTime = 1000 * 60 * 60 * 24 * 3;
export const popupId = 'tip-of-the-day';

@Injectable({
  providedIn: 'root'
})
export class TipsService {
  private routerConfigSubscription: Subscription;
  private neverShowAgainSub: Subscription;
  private tipsConfig: Tips = {global: []};
  private nextTimeToShowTips: Date;
  private modalRef: MatDialogRef<TipOfTheDayModalComponent, any>;
  private neverShowAgain: boolean;
  private firstTime: boolean = true;

  constructor(private httpClient: HttpClient, private store: Store<any>, private matDialog: MatDialog,
  ) {
  }

  initTipsService() {
    this.nextTimeToShowTips = new Date(window.localStorage.getItem('nextTimeToShowTips') || new Date().getTime());

    this.httpClient.get('/onboarding.json')
      .subscribe((tipsConfig: { onboarding: Tip[] }) => {
        this.tipsConfig = {
          global: [], ...tipsConfig.onboarding.reduce((acc, curr) => {
            const context = curr.context || 'global';
            if (acc[context]) {
              acc[context].push(curr);
            } else {
              acc[context] = [curr];
            }
            return acc;
          }, {} as Tips)
        };
      });

    this.neverShowAgainSub = this.store.select(selectNeverShowPopups).pipe(
      map( (neverShowAgain) => neverShowAgain.includes(popupId)),
      distinctUntilChanged()
    ).subscribe(neverShowAgain => {
      this.neverShowAgain = neverShowAgain;
      if (!this.firstTime) {
        if (!neverShowAgain) {
          this.nextTimeToShowTips = new Date();
          window.localStorage.removeItem('nextTimeToShowTips');
        }
      }
      this.firstTime = false;
    });

    this.routerConfigSubscription = combineLatest([
      this.store.select(selectRouterConfig),
      this.store.select(selectCurrentUser),
      this.store.select(selectFirstLogin),
      this.store.select(selectTermsOfUse)
    ])
      .pipe(
        debounceTime(1000),
        filter(([routerConfig, user, firstLogin, tos]) => !firstLogin && !!user && !tos.accept_required && !this.neverShowAgain && this.matDialog.openDialogs.length === 0),
        distinctUntilChanged(([prev], [curr]) => prev?.[prev.length - 1] === curr[curr.length - 1]))
      .subscribe(([routerConfig]) => {
        const urlConfig = routerConfig?.join('/');
        if (this.tipsConfig?.['global'].length || this.tipsConfig?.[urlConfig]) {
          const allTips = [...this.tipsConfig['global']];
          if (this.tipsConfig[urlConfig]) {
            allTips.concat(this.tipsConfig[urlConfig]);
          }
          if (this.isTimeHavePassed()) {
            this.showTipsModal(allTips);
          }
        }
      });

  }

  public showTipsModal(allTips?: Tip[], hideDontShow?: boolean) {
    const visitedIndex = parseInt(window.localStorage.getItem('tipVisitedIndex'), 10) || 0;
    allTips = allTips ? allTips : (Object.values(this.tipsConfig) as any).flat();
    this.modalRef = this.matDialog.open(TipOfTheDayModalComponent, {
      data: {
        tips: allTips,
        visitedIndex,
        hideDontShow: this.neverShowAgain || hideDontShow
      }
    });
    this.modalRef.afterClosed().subscribe((neveShowAgain) => {
      if (neveShowAgain) {
        this.store.dispatch(neverShowPopupAgain({popupId}));
      }
      this.nextTimeToShowTips = new Date(new Date().getTime() + tipsCooldownTime);
      window.localStorage.setItem('nextTimeToShowTips', this.nextTimeToShowTips.toISOString());
    });
  }

  private isTimeHavePassed() {
    return this.nextTimeToShowTips <= new Date();
  }
}
