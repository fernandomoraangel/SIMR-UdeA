import { Directive, ElementRef, Injector } from '@angular/core';
import { UpgradeComponent } from '@angular/upgrade/static';

@Directive({
  selector: 'appAngularJSComponent'
})
export class AngularJSComponentDirective extends UpgradeComponent{
  constructor(elementRef: ElementRef, injector: Injector) {
    super('appAngularJSComponent', elementRef, injector);
  }
}
