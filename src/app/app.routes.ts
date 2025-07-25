import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { CadastroMorador } from './features/moradores/cadastro-morador';
import { Contas } from './features/contas/contas';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'morador', component: CadastroMorador },
  { path: 'contas', component: Contas },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
