import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CamelToTitlePipe} from './camel-to-title.pipe';
import {FilenameFromPath} from './filename-from-path.pipe';
import {FilterPipe} from './filter.pipe';
import {FloorPipe} from './floor.pipe';
import {JoinPipe} from './join.pipe';
import {KeyvalPipe} from './keyval.pipe';
import {NoUnderscorePipe} from './no-underscore.pipe';
import {UniqueByPipe} from './unique-by.pipe';
import {KeyValuePipe} from './key-value.pipe';
import {NAPipe} from './na.pipe';
import {MsToHoursPipe} from './ms-to-hours.pipe';
import {SortPipe} from './sort.pipe';
import {ToExponentialPipe} from './to-exponential.pipe';
import {HighlightSearchTextPipe} from './highlight-search-text.pipe';
import {HideHashPipe} from './hide-hash.pipe';
import {TimeAgoPipe} from './timeAgo';
import {TimeTillNowPipe} from './time-till-now.pipe';
import {MsToSecPipe} from './ms-to-sec.pipe';
import {HasExampleItemPipe} from './has-example-item.pipe';
import {AdvancedFilterPipe} from './advanced-filter.pipe';
import {SafePipe} from './safe.pipe';
import {SelectOptionValueToLabelPipe} from './selectOptionValueToLabel.pipe';
import {IsVideoPipe} from './is-video.pipe';
import {ToPercentagePipe} from './to-precentage.pipe';
import {SimpleFilterPipe} from './simple-filter.pipe';
import {IsAudioPipe} from './is-audio.pipe';
import {ShowSelectedFirstPipe} from './show-selected-first.pipe';
import {CountPipe} from './count.pipe';
import {LabelValuePipe} from './label-value.pipe';
import {HideHashTitlePipe} from './hide-hash-title.pipe';
import {safeAngularUrlParameterPipe} from './safeAngularUrlParameter.pipe';
import {ReplaceViaMapPipe} from './replaceViaMap';
import {FilterByIdPipe} from './filterById.pipe';
import {FilterOutPipe} from './filterOut.pipe';
import {DurationPipe} from './duration.pipe';
import {BreadcrumbsEllipsisPipe} from './breadcrumbs-ellipsis.pipe';
import {ShortProjectNamePipe} from './short-project-name.pipe';
import {ProjectLocationPipe} from './project-location.pipe';
import {StringIncludedInArrayPipe} from './string-included-in-array.pipe';
import {FilterLast} from './filterLast.pipe';
import {ToPropertyArrayPipe} from '@common/shared/pipes/toPropertyArray.pipe';
import {MenuItemTextPipe} from '@common/shared/pipes/menu-item-text.pipe';
import {InitialsPipe} from './initials.pipe';
import {UuidPipe} from './uuid.pipe';
import {FilterInternalPipe} from './filter-internal.pipe';
import {IdToObjectsArrayPipe} from './idToObjectsArray.pipe';
import {IsEmptyPipe} from './is-empty.pipe';
import {HighlightSearchPipe} from './highlight-search.pipe';
import {TemplateInjectorPipe} from './template-injector.pipe';
import {TestConditionalPipe} from './test-conditional.pipe';
import {GroupHasErrorsPipe} from './group-has-errors.pipe';
import {FormgroupHasRequiredFieldPipe} from './formgroup-has-required-field.pipe';
import {FileSizePipe} from '@common/shared/pipes/filesize.pipe';
import {RegexPipe} from '@common/shared/pipes/filter-regex.pipe';
import {ColGetterPipe} from './col-getter.pipe';
import {LabelValueToStringArrayPipe} from './label-value-to-string-array.pipe';
import {ItemByIdPipe} from './item-by-id.pipe';
import {FilterMonitorMetricPipe} from './filter-monitor-metric.pipe';
import {ReversePipe} from './reverse.pipe';
import {HideRedactedArgumentsPipe} from './hide-redacted-arguments.pipe';
import {HasCompletedPipe} from './has-completed.pipe';
import {IsStringPipe} from './is-string.pipe';
import {CleanProjectPathPipe} from './clean-project-path.pipe';

const pipes = [
  CamelToTitlePipe, FilenameFromPath, FilterPipe, FloorPipe, KeyValuePipe, NAPipe, SortPipe, IsVideoPipe, IsAudioPipe, FilterInternalPipe, UuidPipe,
  JoinPipe, KeyvalPipe, LabelValuePipe, NoUnderscorePipe, UniqueByPipe, MsToHoursPipe, MsToSecPipe, DurationPipe,
  ToExponentialPipe, HighlightSearchTextPipe, HighlightSearchPipe, HideHashPipe, HideHashTitlePipe, TimeAgoPipe, TimeTillNowPipe, HasExampleItemPipe, safeAngularUrlParameterPipe,
  AdvancedFilterPipe, SafePipe, SelectOptionValueToLabelPipe, ToPercentagePipe, ReplaceViaMapPipe, FilterByIdPipe, FilterLast, FilterOutPipe, SimpleFilterPipe,
  BreadcrumbsEllipsisPipe, ShortProjectNamePipe, ProjectLocationPipe, StringIncludedInArrayPipe, ToPropertyArrayPipe, MenuItemTextPipe, InitialsPipe, IdToObjectsArrayPipe, IsEmptyPipe,
  TemplateInjectorPipe, TestConditionalPipe, GroupHasErrorsPipe, FormgroupHasRequiredFieldPipe, FileSizePipe, RegexPipe, LabelValueToStringArrayPipe, IsStringPipe,
  ItemByIdPipe, HideRedactedArgumentsPipe, HasCompletedPipe, CleanProjectPathPipe
];

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [pipes, ShowSelectedFirstPipe, CountPipe, ColGetterPipe, FilterMonitorMetricPipe, ReversePipe, ],
  providers: [pipes],
  exports: [pipes, ShowSelectedFirstPipe, CountPipe, ColGetterPipe, FilterMonitorMetricPipe, ReversePipe]
})
export class SharedPipesModule {
}
