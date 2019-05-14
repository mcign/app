import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BikePage } from './bike.page';

describe('BikePage', () => {
  let component: BikePage;
  let fixture: ComponentFixture<BikePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BikePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BikePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
