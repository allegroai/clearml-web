import {EntityTypeEnum} from '../../../../shared/constants/non-common-consts';
import {IFooterState, ItemFooterModel} from './footer-items.models';
import {MenuItems, selectionTags} from '../items.utils';

export class SelectedTagsFooterItem extends ItemFooterModel {

  constructor(
    public entitiesType: EntityTypeEnum,
  ) {
    super();
    this.id = MenuItems.tags;
    this.isTag = true;
    this.disableDescription = 'Tags';
  }

  getItemState(state: IFooterState<any>): {
    icon?: any; title?: string; description?: string; disable?: boolean; disableDescription?: string;
    emit?: boolean; emitValue?: any; preventCurrentItem?: boolean; class?: string; wrapperClass?: string; tags: string[];
    companyTags: string[];
    projectTags: string[];
    tagsFilterByProject: boolean;
  } {
    const tags = state.data[this.id];
    return {
      disable: state.selectionAllHasExample,
      description: this.menuItemText.transform(tags?.selectedFiltered?.length, 'Add Tag'),
      disableDescription: 'Tags',
      emitValue: tags.selectedFiltered,
      tags: selectionTags(state.selected),
      companyTags: state.companyTags,
      projectTags: state.projectTags,
      tagsFilterByProject: state.tagsFilterByProject
    };
  }
}
