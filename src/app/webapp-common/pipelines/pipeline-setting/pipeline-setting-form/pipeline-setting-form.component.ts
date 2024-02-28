import { Component, OnDestroy, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete'
import {
    IOption
  } from '@common/shared/ui-components/inputs/select-autocomplete-with-chips/select-autocomplete-with-chips.component';


@Component({
  selector: 'sm-pipeline-setting-form',
  templateUrl: './pipeline-setting-form.component.html',
  styleUrls: ['./pipeline-setting-form.component.scss']
})
export class PipelineSettingFormComponent implements OnDestroy {
  @ViewChild('emailList') emailList: ElementRef;
  @ViewChild('expression') expression: NgModel;

  @Input() readOnlyintervalsNames: string[];
  @Input() defaultintervalId: string;

  @Output() stepCreated = new EventEmitter();
  @Output() filterSearchChanged = new EventEmitter<{ value: string; loadMore?: boolean }>();

  settingFields = {
    emailList: '',
    emailAlert: false,
    scheduling: false,
    interval: null,
    expression: ''
  };
  intervalsOptions: { label: string; value: string }[];
  intervalsNames: string[];


  private subs = new Subscription();

  constructor() {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  intervalOptions: string[] = ['custom', 'daily', 'hourly', 'weekly', 'monthly', 'yearly'];
  cronExpressions: { [key: string]: string } = {
    'custom': '',
    'daily': '0 0 * * *',
    'hourly': '0 * * * *',
    'weekly': '0 0 * * 0',
    'monthly': '0 0 1 * *',
    'yearly': '0 0 1 1 *'
  };

  intervalSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedInterval = event.option.value;
    this.settingFields.interval = selectedInterval;
    this.settingFields.expression = this.cronExpressions[selectedInterval];
  }

  checkCronExpression(): void {
    const enteredExpression = this.settingFields.expression.trim();
    const matchingInterval = Object.entries(this.cronExpressions).find(([interval, expression]) => expression === enteredExpression);
    if (matchingInterval) {
      this.settingFields.interval = matchingInterval[0];
    } else {
      this.settingFields.interval = 'custom';
    }
  }

  navigateToWebsite(): void {
    window.open('https://en.wikipedia.org/wiki/Cron', '_blank');
  }
  send() {
    this.stepCreated.emit(this.settingFields);
  }
}

