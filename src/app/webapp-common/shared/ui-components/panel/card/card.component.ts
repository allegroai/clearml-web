import {Component, Input} from '@angular/core';

import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';

@Component({
  selector: 'sm-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  standalone: true,
  imports: [
    ClickStopPropagationDirective
]
})
export class CardComponent {

  @Input() header: string;
  @Input() height: number;

  // TODO: delete the following:
  @Input() collapsed = false;
  @Input() collapsible = false;
  @Input() fixedSize = false;
  @Input() overflowVisible = false;
  @Input() cardSign = '';
  @Input() showSeparator = true;
  @Input() whiteHeader = false;
  @Input() whiterHeader = false;
  @Input() isExample = false;
  @Input() isFolder = false;
  @Input() subFolderTitle = '';
  @Input() oneTabMode: boolean;
  @Input() ribbonText: string;


  public showSecondTab = false;
  public secondTabIsHovered: boolean;
  public highlightFirstTab: boolean;

  setShowSecondTab(show: boolean) {
    this.showSecondTab = show;
  }

  setSecondTabHover(isHovered: boolean) {
    this.secondTabIsHovered = isHovered;
  }

  setHighlightFirstTab(highlight: boolean) {
    this.highlightFirstTab = highlight;
  }
}
