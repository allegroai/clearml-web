import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectColorPickerProps} from '../../directives/choose-color/choose-color.reducer';
import {Subscription} from 'rxjs';
import {ColorPickerProps} from '../../directives/choose-color/choose-color.actions';
import {hexToRgb} from '../../../services/color-hash/color-hash.utils';
import {ColorHashService} from '../../../services/color-hash/color-hash.service';

@Component({
  selector   : 'sm-color-picker-wrapper',
  templateUrl: './color-picker-wrapper.component.html',
  styleUrls  : ['./color-picker-wrapper.component.scss']
})
export class ColorPickerWrapperComponent implements OnInit, OnDestroy  {

  public defaultColor: string;
  public presetColors = [
    '#1f77b4',  // muted blue
    '#ff7f0e',  // safety orange
    '#2ca02c',  // cooked asparagus green
    '#d62728',  // brick red
    '#9467bd',  // muted purple
    '#8c564b',  // chestnut brown
    '#e377c2',  // raspberry yogurt pink
    '#7f7f7f',  // middle gray
    '#bcbd22',  // curry yellow-green
    '#17becf',   // blue-teal
    '#af1d41',
    '#d5d728'

  ];
  private propsSub: Subscription;
  public props: ColorPickerProps;
  public toggle = false;

  constructor(private store: Store<any>, private colorHashService: ColorHashService) {
  }

  ngOnInit() {
    this.propsSub = this.store.select(selectColorPickerProps)
      .subscribe((props) => {
        this.props = props;
        this.defaultColor = props?.defaultColor;
        this.toggle = !!props;
      });
  }

  selectColor(event) {
    const color = hexToRgb(event);
    this.colorHashService.setColorForString(this.props.cacheKey, color);
  }

  ngOnDestroy(): void {
    this.propsSub.unsubscribe();
  }
}
