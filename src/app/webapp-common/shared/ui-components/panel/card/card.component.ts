import {Component, Input, OnInit} from '@angular/core';
import {NgIf} from '@angular/common';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';

@Component({
  selector: 'sm-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    ClickStopPropagationDirective
  ]
})
export class CardComponent implements OnInit {

  @Input() header: string;
  @Input() height: number;

  // TODO: delete the following:
  @Input() collapsed = false;
  @Input() collapsible = false;
  @Input() fixedSize = false;
  @Input() overflowVisible = false;
  @Input() cardSign = '';
  @Input() showSeperator = true;
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

  constructor() {
  }

  ngOnInit() {
  }

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
