import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'sm-section-header',
  templateUrl: './section-header.component.html',
  styleUrls: ['./section-header.component.scss']
})
export class SectionHeaderComponent implements OnInit {

  @Input() label: string;
  @Input() helpText: string;
  @Input() showBlob: boolean;
  @Input() error: string | null;

  @Output() learnMoreClicked = new EventEmitter();


  @ViewChild(MatMenuTrigger, { static: true }) trigger: MatMenuTrigger;

  constructor() {}

  ngOnInit() {}

  openMenu() {
    this.trigger.openMenu();
  }

  closeMenu() {
    this.trigger.closeMenu();
  }
}
