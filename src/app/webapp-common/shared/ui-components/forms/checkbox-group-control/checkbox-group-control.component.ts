import { ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { ImmutableFormContainer } from '../immutableFormContainer';

@Component({
  selector: 'sm-checkbox-group-control',
  templateUrl: './checkbox-group-control.component.html',
  styleUrls: ['./checkbox-group-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxGroupControlComponent extends ImmutableFormContainer {

  // map foreach checkbox, when the key is the checkbox name.
  @Input() options: Map<string, string>;
  @Input() isReadonly: boolean;

  @ContentChild(TemplateRef) templateRef: TemplateRef<any>;

  get children(): Array<string> {
    return this.options ? Object.keys(this.options) : [];
  }

}
