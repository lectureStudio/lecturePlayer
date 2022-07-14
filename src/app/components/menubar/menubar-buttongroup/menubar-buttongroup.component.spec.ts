import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenubarButtongroupComponent } from './menubar-buttongroup.component';

describe('MenubarButtongroupComponent', () => {
  let component: MenubarButtongroupComponent;
  let fixture: ComponentFixture<MenubarButtongroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenubarButtongroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenubarButtongroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
