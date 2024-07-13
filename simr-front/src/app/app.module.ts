import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module'; // Debe ser incluido de último en los 'imports' del Módulo
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './pages/home/home.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient } from '@angular/common/http';
import { ActorModule } from './modules/actor/actor.module';
import { SigninComponent } from './pages/signin/signin.component';
import { SignupComponent } from './pages/signup/signup.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';


// Import the UpgradeModule from @angular/upgrade/static
// import { UpgradeModule } from '@angular/upgrade/static';
// import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


// Define your AngularJS module 
// declare const angular: any;
// const angularJsApp = angular.module('angularJsApp', []);

// // Define a dummy AngularJS component for demonstration
// angularJsApp.component('legacyComponent', {
//   template: `<h1>Legacy AngularJS Component</h1>`
// });


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PageNotFoundComponent,
    SigninComponent,
    SignupComponent
  ],
  imports: [
    BrowserModule,
    ActorModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    // UpgradeModule
  ],
  providers: [
    provideHttpClient(),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() { }
}
// export class AppModule {
//   constructor(private upgrade: UpgradeModule) {}

//   ngDoBootstrap() {
//     this.upgrade.bootstrap(document.body, ['angularJsApp']);
//   }
// }

// platformBrowserDynamic().bootstrapModule(AppModule);
