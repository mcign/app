import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegKeyPage } from './reg-key.page';

describe('RegKeyPage', () => {
  let component: RegKeyPage;
  let fixture: ComponentFixture<RegKeyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegKeyPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegKeyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
