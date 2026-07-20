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
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

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
import { AuthRouteComponent } from './features/auth/auth-route.component';
import { ShellComponent } from './core/shell/shell.component';
import { NoImplementadoComponent } from './shared/no-implementado/no-implementado.component';
import { SoundWaveComponent } from './shared/sound-wave/sound-wave.component';

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
    AuthRouteComponent,
    ShellComponent,
    NoImplementadoComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatCardModule,
    SoundWaveComponent,
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
