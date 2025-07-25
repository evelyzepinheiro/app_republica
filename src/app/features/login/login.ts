import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  username: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  rememberMe: boolean = false;

  // Dados mockados para teste
  private readonly MOCK_USERS = [
    { username: 'admin', password: '123', name: 'Administrador' }
  ];

  constructor(private router: Router) { }

  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Por favor, preencha todos os campos.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Simular delay de requisição
    setTimeout(() => {
      const user = this.authenticateUser(this.username, this.password);

      if (user) {
        this.handleLoginSuccess(user);
      } else {
        this.handleLoginError();
      }

      this.isLoading = false;
    }, 1000);
  }

  private authenticateUser(username: string, password: string) {
    return this.MOCK_USERS.find(
      user => user.username === username && user.password === password
    );
  }

  private handleLoginSuccess(user: any) {
    console.log('Login realizado com sucesso!', user);

    // Salvar dados do usuário no localStorage (mock)
    const userData = {
      id: Math.random().toString(36).substr(2, 9),
      username: user.username,
      name: user.name,
      isAuthenticated: true,
      loginTime: new Date().toISOString(),
      rememberMe: this.rememberMe
    };

    if (this.rememberMe) {
      localStorage.setItem('userData', JSON.stringify(userData));
    } else {
      sessionStorage.setItem('userData', JSON.stringify(userData));
    }

    this.router.navigate(['/morador']); // Descomente quando criar a rota
  }

  private handleLoginError() {
    this.errorMessage = 'Usuário ou senha incorretos. Tente novamente.';
    console.log('Falha no login');
  }

  // Método para limpar mensagens de erro quando o usuário digita
  onInputChange() {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  // Método para logout (pode ser usado em outros componentes)
  static logout() {
    localStorage.removeItem('userData');
    sessionStorage.removeItem('userData');
  }

  // Método para verificar se o usuário está logado
  static isLoggedIn(): boolean {
    return !!(localStorage.getItem('userData') || sessionStorage.getItem('userData'));
  }
}
