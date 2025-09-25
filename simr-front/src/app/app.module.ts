import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  HttpClientModule,
  HTTP_INTERCEPTORS,
  HttpClient,
} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Material Modules
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

// Feature Modules
// import { ActorModule } from './modules/actor/actor.module';
// import { ArchivoModule } from './modules/archivo/archivo.module';
// import { PruebaModule } from './modules/prueba/prueba.module';
import { AppRoutingModule } from './app-routing.module';

// Components
import { AppComponent } from './app.component';
import { HomeComponent } from './features/home/home.component';
// import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';

// Services and Guards
import { AuthService } from './core/auth/auth.service';
import { AuthGuard } from './core/auth/auth.guard';
import { AuthInterceptor } from './core/auth/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PageNotFoundComponent,
    LoginComponent,
    SignupComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    AppRoutingModule, // siempre el último en 'imports'
  ],
  providers: [
    AuthService,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private http: HttpClient) {
    // Puedes hacer una llamada de prueba al backend aquí si es necesario
    // this.http.get('http://localhost:3000/api/test').subscribe(response => {
    //   console.log('Backend response:', response);
    // });
  }
}
