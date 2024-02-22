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
  public readonly intervalsRoot = {label: 'My interval', value: null};
  @ViewChild('intervalInput') intervalInput: NgModel;
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
  rootFiltered = false;
  isAutoCompleteOpen = false;
  loading = false;
  noMoreOptions = false;

  private subs = new Subscription();

  constructor() {}

  ngOnInit(): void {
    this.searchChanged(['*', null].includes(this.defaultintervalId) ? '' : this.defaultintervalId);
    setTimeout(() => {
      this.subs.add(this.intervalInput.valueChanges.subscribe(searchString => {
        if (searchString !== this.settingFields.interval) {
          this.searchChanged(searchString?.label || searchString || '');
        }
      }));
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }


  intervalSelected(event: MatAutocompleteSelectedEvent): void {
    this.settingFields.interval = event.option.viewValue;
  }
  setIsAutoCompleteOpen(focus: boolean) {
    this.isAutoCompleteOpen = focus;
  }

  displayFn(interval: IOption | string) {
    return typeof interval === 'string' ? interval : interval?.label;
  }

  clear() {
    this.intervalInput.control.setValue('');
  }

  send() {
    this.stepCreated.emit(this.settingFields);
  }

  searchChanged(searchString: string) {
    this.intervalsOptions = null;
    this.intervalsNames = null;
    this.rootFiltered = searchString && !this.intervalsRoot.label.toLowerCase().includes(searchString.toLowerCase());
    searchString !== null && this.filterSearchChanged.emit({ value: searchString, loadMore: false });
  }

  loadMore(searchString) {
    this.loading = true;
    this.filterSearchChanged.emit({ value: searchString || '', loadMore: true });
  }

  isFocused(locationRef: HTMLInputElement) {
    return document.activeElement === locationRef;
  }
}

