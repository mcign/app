import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageKeysPage } from './manage-keys.page';

describe('ManageKeysPage', () => {
  let component: ManageKeysPage;
  let fixture: ComponentFixture<ManageKeysPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageKeysPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageKeysPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
