import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';
import {isEqual} from 'lodash-es';
import {selectColorPickerProps} from '@common/shared/ui-components/directives/choose-color/choose-color.reducer';
import {ColorPickerProps} from '@common/shared/ui-components/directives/choose-color/choose-color.actions';
import {ColorHashService} from '@common/shared/services/color-hash/color-hash.service';
import tinycolor from 'tinycolor2';

@Component({
  selector: 'sm-color-picker-wrapper',
  templateUrl: './color-picker-wrapper.component.html',
  styleUrls: ['./color-picker-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColorPickerWrapperComponent implements OnInit, OnDestroy {

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
    '#d5d728',
  ];
  public alphaPresetColors = [...this.presetColors,
    'rgba(0,0,0,0)'
  ];

  private propsSub: Subscription;
  public props: ColorPickerProps;
  public toggle = false;

  constructor(private store: Store<any>, private colorHashService: ColorHashService, private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.propsSub = this.store.select(selectColorPickerProps)
      .pipe(distinctUntilChanged(isEqual))
      .subscribe((props) => {
        this.props = props;
        this.defaultColor = props?.defaultColor;
        this.toggle = !!props;
        this.cdr.detectChanges();
      });
  }

  selectColor(event: string) {
    const {r, g, b, a} = tinycolor(event).toRgb();
    const color = [r, g, b, a];
    this.colorHashService.setColorForString(this.props.cacheKey, color);
  }

  ngOnDestroy(): void {
    this.propsSub.unsubscribe();
  }
}
