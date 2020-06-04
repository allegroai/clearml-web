import {Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[smCheckPermission]'
})
export class CheckPermissionDirective {

  @Input() set smCheckPermission(permission: string) {
    this.viewContainer.createEmbeddedView(this.templateRef);
  }
  constructor(private templateRef: TemplateRef<any>,
              private viewContainer: ViewContainerRef
  ) {
  }
}
