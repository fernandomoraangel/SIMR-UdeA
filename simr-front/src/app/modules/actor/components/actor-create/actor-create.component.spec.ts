import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActorCreateComponent } from './actor-create.component';

describe('ActorCreateComponent', () => {
  let component: ActorCreateComponent;
  let fixture: ComponentFixture<ActorCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActorCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActorCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
