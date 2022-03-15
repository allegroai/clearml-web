import {Directive, ElementRef, HostListener} from '@angular/core';
import {TooltipDirective} from './tooltip.directive';

@Directive({
  selector: '[smShowTooltipIfEllipsis]'
})
export class ShowTooltipIfEllipsisDirective {
  constructor(
    private matTooltip: TooltipDirective,
    private elementRef: ElementRef<HTMLElement>
  ) {}

  @HostListener('mouseenter', ['$event'])
  setTooltipState(): void {
    const element = this.elementRef.nativeElement;
    if(element.tagName==='MAT-OPTION' && element.firstElementChild?.tagName==='SPAN'){
      this.matTooltip.disabled = element.firstElementChild.scrollWidth === element.firstElementChild.clientWidth;
    } else {
      this.matTooltip.disabled = element.scrollWidth === element.clientWidth;
    }
  }

}
