import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectOverlayComponent } from './select-overlay.component';

describe('SelectOverlayComponent', () => {
  let component: SelectOverlayComponent;
  let fixture: ComponentFixture<SelectOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectOverlayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
