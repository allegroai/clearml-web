import {
  ChangeDetectionStrategy,
  Component,
  effect,
  forwardRef,
  input,
  output, signal
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormControl,
  ReactiveFormsModule,
  NG_VALIDATORS, ValidationErrors, Validator, Validators
} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {SearchTextDirective} from '@common/shared/ui-components/directives/searchText.directive';
import {DotsLoadMoreComponent} from '@common/shared/ui-components/indicators/dots-load-more/dots-load-more.component';
import {rootProjectsPageSize} from '@common/constants';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

export interface baseEntity {
  id?: string;
  name?: string;
}

@Component({
  selector: 'sm-paginated-entity-selector',
  templateUrl: './paginated-entity-selector.component.html',
  styleUrls: ['./paginated-entity-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PaginatedEntitySelectorComponent),
        multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PaginatedEntitySelectorComponent),
      multi: true
    }
  ],
  imports: [
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    LabeledFormFieldDirective,
    ClickStopPropagationDirective,
    TooltipDirective,
    SearchTextDirective,
    MatProgressSpinner,
    DotsLoadMoreComponent,
  ],
})
export class PaginatedEntitySelectorComponent implements ControlValueAccessor, Validator {
  protected control = new FormControl<string>(null);
  protected noMoreOptions: boolean;
  protected disabled: boolean;
  protected error: string = null;
  protected loading = signal<boolean>(false);
  private previousLength: number;
  data = input<baseEntity[]>([]);
  label = input();
  placeHolder = input('');
  createNewSuffix = input<boolean>(false);
  isRequired = input<boolean>(false)

  getEntities = output<string>();
  loadMore = output<string>();
  createNewSelected = output<string>();
  protected onTouched: () => void;
  private onChange: (value) => void;
  private onValidation: (value) => void;

  constructor() {
    this.control.valueChanges.pipe(takeUntilDestroyed()).subscribe(value => {
      this.onChange && this.onChange(value);
      this.onValidation && this.onValidation(value);
    });

    effect(() => {
      if (this.data()) {
        const length = this.data().length;
        this.loading.set(false);
        this.noMoreOptions = length === this.previousLength || length < rootProjectsPageSize;
        this.previousLength = length;
      }
    }, {allowSignalWrites: true});

    effect(() => {
      this.isRequired() ? this.control.addValidators([Validators.required]) : this.control.removeValidators([Validators.required]);
      this.control.updateValueAndValidity();
    });
  }

  displayFn(item: string | baseEntity): string {
    return typeof item === 'string' ? item : item?.name;
  }

  getEntitiesFn(value: string) {
    this.loading.set(true);
    this.getEntities.emit(value);
  }

  loadMoreEntities(value: string) {
    this.loading.set(true);
    this.loadMore.emit(value);
  }

  writeValue(value: string) {
    this.control.patchValue(value, {emitEvent: false});
  }

  registerOnChange(fn: () => void) {
    this.onChange = fn
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean) {
    isDisabled ? this.control.disable() : this.control.enable();
  }

  validate(/*control: AbstractControl*/): ValidationErrors | null {
    return this.isRequired() && !this.control.value ? {required: true} : null;
  }

  registerOnValidatorChange(fn) {
    this.onValidation = fn
  }
}
