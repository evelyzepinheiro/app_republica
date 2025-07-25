import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroMorador } from './cadastro-morador';

describe('CadastroMorador', () => {
  let component: CadastroMorador;
  let fixture: ComponentFixture<CadastroMorador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroMorador]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroMorador);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
