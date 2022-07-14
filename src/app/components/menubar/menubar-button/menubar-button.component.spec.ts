import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenubarButtonComponent } from './menubar-button.component';

describe('MenubarButtonComponent', () => {
  let component: MenubarButtonComponent;
  let fixture: ComponentFixture<MenubarButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenubarButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenubarButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
