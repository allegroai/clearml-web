import {Directive, HostListener} from '@angular/core';

@Directive({
  selector: '[smPreventDefault]',
  standalone: true
})
export class ClickPreventDefaultDirective {
  @HostListener('click', ['$event'])
  public onClick(event: MouseEvent): void {
    event.preventDefault();
  }
}
