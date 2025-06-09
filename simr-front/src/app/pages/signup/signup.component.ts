import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void { }

  onSubmit(): void {
    if (this.signupForm.valid) {
      console.log("signupForm Values:", this.signupForm.value);
      // Aquí puedes agregar la lógica para enviar los datos al servidor
      const newUser: User = this.signupForm.value;
      newUser.provider = 'local'; // o cualquier valor predeterminado
      // this.authService.signup(newUser).subscribe({
      this.authService.register(newUser).subscribe({
        next: response => {
          // console.log('Registration successful', response);
          this.router.navigate(['/mi-ruta-2']);
        },
        error: error => {
          console.error('Error during registration', error);
        }
      });
    }
  }
}
