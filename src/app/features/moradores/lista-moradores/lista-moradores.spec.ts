import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaMoradores } from './lista-moradores';

describe('ListaMoradores', () => {
  let component: ListaMoradores;
  let fixture: ComponentFixture<ListaMoradores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaMoradores]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaMoradores);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
