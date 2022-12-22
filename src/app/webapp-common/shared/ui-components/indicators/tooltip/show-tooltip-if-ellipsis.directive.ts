import {Directive, ElementRef, HostListener, Input} from '@angular/core';
import {TooltipDirective} from './tooltip.directive';

@Directive({
  selector: '[smShowTooltipIfEllipsis]',
  standalone:  true
})
export class ShowTooltipIfEllipsisDirective {
  constructor(
    private matTooltip: TooltipDirective,
    private elementRef: ElementRef<HTMLElement>
  ) {}
  @Input() showAllwaysTooltip = false;
  @HostListener('mouseenter', ['$event'])
  setTooltipState(): void {
    if(this.showAllwaysTooltip) {
      return;
    }
    const element = this.elementRef.nativeElement;
    if(element.tagName==='MAT-OPTION' && element.firstElementChild?.tagName==='SPAN'){
      this.matTooltip.disabled = element.firstElementChild.scrollWidth === element.firstElementChild.clientWidth;
    } else {
      this.matTooltip.disabled = element.scrollWidth === element.clientWidth;
    }
  }

}
