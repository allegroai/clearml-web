import {Component, OnInit} from '@angular/core';
import {setFilterByUser} from '../../../core/actions/users.actions';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/internal/Observable';
import {selectShowOnlyUserWork} from '../../../core/reducers/users-reducer';

@Component({
  selector: 'sm-show-only-user-work',
  templateUrl: './show-only-user-work.component.html',
  styleUrls: ['./show-only-user-work.component.scss']
})
export class ShowOnlyUserWorkComponent implements OnInit {
  public isUserMenuOpened: boolean;
  public showOnlyUserWork$: Observable<boolean>;
  constructor(private store: Store<any>) {
    this.showOnlyUserWork$ = this.store.select(selectShowOnlyUserWork);
  }



  ngOnInit(): void {
  }
  userFilterChanged(userFiltered: boolean) {
    this.store.dispatch(setFilterByUser({showOnlyUserWork: userFiltered}));
  }

  userFilterMenuOpened(isUserMenuOpened: boolean) {
    this.isUserMenuOpened = isUserMenuOpened;
  }

}
