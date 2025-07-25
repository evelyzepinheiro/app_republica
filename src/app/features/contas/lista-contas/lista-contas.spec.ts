import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaContas } from './lista-contas';

describe('ListaContas', () => {
  let component: ListaContas;
  let fixture: ComponentFixture<ListaContas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaContas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaContas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
