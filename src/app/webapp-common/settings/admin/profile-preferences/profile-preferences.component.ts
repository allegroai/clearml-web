import { Component, OnInit } from '@angular/core';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {neverShowPopupAgain} from '@common/core/actions/layout.actions';
import {Store} from '@ngrx/store';
import {popupId} from '@common/shared/services/tips.service';
import {selectNeverShowPopups} from '@common/core/reducers/view.reducer';

@Component({
  selector: 'sm-profile-preferences',
  templateUrl: './profile-preferences.component.html',
  styleUrls: ['./profile-preferences.component.scss']
})
export class ProfilePreferencesComponent implements OnInit {

  public supportReScaling = window['chrome'] || window['safari'];
  public disableHidpiChanged: boolean = false;
  public popupId = popupId;
  public disableHidpi = window.localStorage.getItem('disableHidpi') === 'true';
  public neverShowTipsAgain$ = this.store.select(selectNeverShowPopups);

  constructor(private store: Store<any>) { }

  ngOnInit(): void {}

  hidpiChange(event: MatSlideToggleChange) {
    window.localStorage.setItem('disableHidpi', JSON.stringify(event.checked));
    this.disableHidpiChanged = !this.disableHidpiChanged;
  }

  reload(event) {
    if (this.disableHidpiChanged) {
      event.stopPropagation();
      event.preventDefault();
      window.location.reload();
    }
  }

  setNeverShowTipsAgain($event: MatSlideToggleChange) {
    this.store.dispatch(neverShowPopupAgain({popupId, reset: !$event.checked}));
  }
}
