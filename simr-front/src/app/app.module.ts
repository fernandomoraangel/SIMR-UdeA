import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { ActoresComponent } from './pages/actores/actores.component';

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
    MainComponent,
    ActoresComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    // UpgradeModule
  ],
  providers: [provideHttpClient()],
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
