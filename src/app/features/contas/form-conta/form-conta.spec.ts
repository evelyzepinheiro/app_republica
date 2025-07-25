import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormConta } from './form-conta';

describe('FormConta', () => {
  let component: FormConta;
  let fixture: ComponentFixture<FormConta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormConta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormConta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
