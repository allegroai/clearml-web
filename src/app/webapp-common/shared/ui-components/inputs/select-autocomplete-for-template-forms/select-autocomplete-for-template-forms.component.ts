import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild} from '@angular/core';
import {TemplateFormSectionBase} from '../../template-forms-ui/templateFormSectionBase';
import {NG_VALUE_ACCESSOR, NgForm} from '@angular/forms';
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {filter, map, startWith} from "rxjs/operators";
import {asyncScheduler} from "rxjs";
import {Observable} from "rxjs/internal/Observable";
import {MatOptionSelectionChange} from "@angular/material/core";


export interface IOption {
  label: string;
  value: string;
}

@Component({
  selector: 'sm-select-autocomplete-for-template-forms',
  templateUrl: './select-autocomplete-for-template-forms.component.html',
  styleUrls: ['./select-autocomplete-for-template-forms.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectAutocompleteForTemplateFormsComponent),
      multi: true
    }]
})

export class SelectAutocompleteForTemplateFormsComponent extends TemplateFormSectionBase implements OnInit {
  private _items: { label: string; value: string }[];
  private _focusIt: any;
  public loading: boolean = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filterText: string = '';
  isNewName: boolean = false;
  @Input() errorMsg: string;
  @Input() multiple: boolean = true;
  @Input() name: string;
  @Output() customOptionAdded = new EventEmitter();
  @Input() formFieldClass: string;
  @Input() appearance: 'outline' | 'fill' = 'outline';

  public filteredItems: Observable<{ label: string; value: string }[]>;

  @Input() set isDisabled(disabled: boolean) {
    this.disabled = disabled;
  }

  @Input() set items(items: { label: string; value: string }[]) {
    this.loading = false;
    this._items = items;
  }

  get items() {
    return this._items || [];
  }

  @Input() disabled: boolean = false;
  // @Input() required: boolean = false;
  @Input() clearable: boolean = true;
  @Input() placeholder: string = '';
  @Input() optionAddable: boolean = false;
  @Input() autofocus: boolean = false;

  @Input() set focusIt(isFocus) {
    if (isFocus && this.autofocus === true) {
      this._focusIt = isFocus;
    } else {
      this._focusIt = false;
    }
  }

  get focusIt() {
    return this._focusIt;
  }

  @ViewChild('autoSelectForm', {static: true}) autoSelectForm: NgForm;
  @ViewChild('autocompleteInput') autocompleteInput: ElementRef<HTMLInputElement>;

  ngOnInit() {
    setTimeout(() => {
      this.filteredItems = this.autoSelectForm.controls[this.name].valueChanges
        .pipe(
          filter(value => value !== undefined),
          map(value => typeof value === 'string' ? value : value.label),
          map(value => this._filter(value)),
          startWith(this.items, asyncScheduler)
        );
    }, 0);
  }

  private _filter(value: string) {
    this.filterText = value;
    const itemsLabels = this.items.map(item => item.label);
    this.isNewName = !itemsLabels.includes(value);
    const filterValue = value?.toLowerCase();
    return this.items.filter((item: any) => item.label?.toLowerCase().includes(filterValue));
  }

  displayFn(item: any): string {
    return item && item.label ? item.label : item;
  }


  optionSelected($event: MatAutocompleteSelectedEvent) {
    if (typeof $event === 'string') {
      return;
    }
    this.writeValue($event);
  }

  customOptionSelected($event: MatOptionSelectionChange) {
    this.customOptionAdded.emit($event.source.value.label);
  }
}
