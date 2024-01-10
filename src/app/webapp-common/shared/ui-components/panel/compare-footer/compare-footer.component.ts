import {Component, Input} from '@angular/core';

@Component({
  selector: 'sm-compare-footer',
  templateUrl: './compare-footer.component.html',
  styleUrls: ['./compare-footer.component.scss'],
  standalone: true,
})
export class CompareFooterComponent {

  @Input() visible = false;
}
