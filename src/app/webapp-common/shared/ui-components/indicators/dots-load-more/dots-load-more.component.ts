import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ScrollEndDirective} from '@common/shared/ui-components/directives/scroll-end.directive';

@Component({
  selector: 'sm-dots-load-more',
  standalone: true,
  imports: [
    ScrollEndDirective
  ],
  templateUrl: './dots-load-more.component.html',
  styleUrl: './dots-load-more.component.scss'
})
export class DotsLoadMoreComponent {
  @Input() loading: boolean;
  @Output() loadMore= new EventEmitter();
}
