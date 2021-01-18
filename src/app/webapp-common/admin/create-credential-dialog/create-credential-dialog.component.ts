import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'sm-create-credential-dialog',
  templateUrl: './create-credential-dialog.component.html',
  styleUrls: ['./create-credential-dialog.component.scss']
})
  export class CreateCredentialDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: {credential: any; workspace?: string}) {}

  ngOnInit() {
  }

}
