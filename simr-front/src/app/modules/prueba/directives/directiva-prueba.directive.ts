import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'appDirectivaPrueba'
})
export class DirectivaPruebaDirective {
  @Input() appDirectivaPrueba: string = '';

  constructor(private el: ElementRef) { }

  @HostListener('mouseenter') onMouseEnter() {
    this.highlight(this.appDirectivaPrueba || 'yellow');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.highlight('');
  }

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }

}
