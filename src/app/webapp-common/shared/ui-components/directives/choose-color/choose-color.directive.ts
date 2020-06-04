import {ChangeDetectorRef, ComponentFactoryResolver, ComponentRef, Directive, ElementRef, HostListener, Input, ViewContainerRef} from '@angular/core';
import {ColorHashService} from '../../../services/color-hash/color-hash.service';
import {ColorPickerWrapperComponent} from '../../inputs/color-picker/color-picker-wrapper.component';
import {hexToRgb, RGB2HEX} from '../../../services/color-hash/color-hash.utils';
import {Store} from '@ngrx/store';
import {showColorPicker} from './choose-color.actions';

@Directive({
  selector: '[smChooseColor]',
})
export class ChooseColorDirective {
  readonly colorTopOffset    = 100;
  readonly colorPickerWidth  = 230;
  readonly colorPickerHeight = 460 - this.colorTopOffset;
  @Input() colorButtonRef;
  @Input() colorButtonClass: string;
  @Input() stringToColor: string;

  @Input() set defaultColor(defaultColor) {
    this._defaultColor = this.normalizeColorToHex(defaultColor);
  }

  get defaultColor() {
    return this._defaultColor;
  }

  private _defaultColor: string;

  @HostListener('mousedown', ['$event'])
  public onMouseDown(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
  }

  @HostListener('click', ['$event'])
  public onClick(event: MouseEvent): void {
    const elementsWithClass = this.colorButtonClass ? Array.from(this.el.nativeElement.querySelectorAll(this.colorButtonClass)) : [];
    const matchingEl        = elementsWithClass.find(el => el === event.target);
    const matchingRef       = this.colorButtonRef && this.colorButtonRef.nativeElement ? this.colorButtonRef.nativeElement : this.colorButtonRef;

    if (matchingEl || matchingRef === event.target) {
      event.stopPropagation();
      this.openColorPicker(event);
    }
  }

  constructor(private el: ElementRef, private store: Store<any>) {}

  openColorPicker(event: MouseEvent) {
    let top = event.pageY - (this.colorPickerHeight / 3);
    let left = event.pageX;
    if (event.pageY + this.colorPickerHeight >= (window.innerHeight || document.documentElement.clientHeight)) {
      top = (event.pageY) - this.colorPickerHeight;
    }
    if (event.clientX + this.colorPickerWidth >= (window.innerWidth || document.documentElement.clientWidth)) {
      left = (event.clientX) - this.colorPickerWidth;
    }

    this.store.dispatch(showColorPicker({
      top,
      left,
      theme: 'light',
      defaultColor: this.defaultColor,
      cacheKey: this.stringToColor
    }));
    event.stopPropagation();
  }

  private normalizeColorToHex(defaultColor) {
    if (typeof defaultColor === 'string') {
      if (defaultColor.includes('#')) {
        return defaultColor; // It's already hex
      }
      if (defaultColor.includes('rgb')) {
        // rgb() or rgba()
        const openParenthisis    = defaultColor.indexOf('(');
        const closingParenthisis = defaultColor.indexOf(')');
        defaultColor             = defaultColor.slice(openParenthisis + 1, closingParenthisis).split(',');
      }
    }
    if (Array.isArray(defaultColor)) {
      return RGB2HEX(defaultColor);
    }
  }
}

export function attachColorChooser(text: string, buttonElement: Element, colorHash: ColorHashService, store: Store<any>) {
  const directive = new ChooseColorDirective(new ElementRef(buttonElement), store);
  directive.colorButtonRef = new ElementRef(buttonElement);
  directive.stringToColor  = text;
  const listener = (e: MouseEvent) => {
    directive.defaultColor = colorHash.initColor(text);
    directive.openColorPicker(e);
  };
  buttonElement.removeEventListener('click', listener);
  buttonElement.addEventListener('click', listener);
}
