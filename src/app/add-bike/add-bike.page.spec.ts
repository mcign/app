import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBikePage } from './add-bike.page';

describe('AddBikePage', () => {
  let component: AddBikePage;
  let fixture: ComponentFixture<AddBikePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddBikePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBikePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
