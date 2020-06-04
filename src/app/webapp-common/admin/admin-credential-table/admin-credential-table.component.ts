import {Component} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {AdminCredentialTableBaseDirective} from '../admin-credential-table.base';
import {TIME_FORMAT_STRING} from '../../constants';


@Component({
  selector   : 'sm-admin-credential-table',
  templateUrl: './admin-credential-table.component.html',
  styleUrls  : ['./admin-credential-table.component.scss']
})
export class AdminCredentialTableComponent extends AdminCredentialTableBaseDirective {
  TIME_FORMAT_STRING = TIME_FORMAT_STRING;
  constructor(public dialog: MatDialog) {
    super(dialog);
  }
}
