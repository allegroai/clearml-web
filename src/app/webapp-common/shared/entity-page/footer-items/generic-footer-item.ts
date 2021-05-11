import {ItemFooterModel} from './footer-items.models';

export class GenericFooterItem extends ItemFooterModel {
  emit = true;
  constructor({icon = null,
                title = '',
                disable = false,
                disableDescription = '',
                className = ''
              } = {}) {
    super();
    this.icon = icon;
    this.title = title;
    this.disable = disable;
    this.disableDescription = disableDescription;
    this.class = className;
  }
}
