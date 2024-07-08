import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActorEditComponent } from './actor-edit.component';

describe('ActorEditComponent', () => {
  let component: ActorEditComponent;
  let fixture: ComponentFixture<ActorEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActorEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActorEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
