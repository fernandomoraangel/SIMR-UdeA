import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { UpgradeModule } from '@angular/upgrade/static';
import { AppModule } from './app/app.module';
import { downgradeModule } from '@angular/upgrade/static';
import angular from 'angular';

// Original code
platformBrowserDynamic().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true
})
  .catch(err => console.error(err));
// (Fin Original code)






// // Define your AngularJS module
// const angularJsModule = angular.module('angularJsModule', []);

// // Define the AngularJS app
// const app = angular.module('myApp', [angularJsModule.name]);

// platformBrowserDynamic()
//   .bootstrapModule(AppModule, {
//     ngZoneEventCoalescing: true
//   })
//   .then(platformRef => {
//     // Initialize the Angular Upgrade module
//     const upgrade = platformRef.injector.get(UpgradeModule) as UpgradeModule;
//     // upgrade.bootstrap(document.body, [angularJsModule.name]);
//     upgrade.bootstrap(document.body, ['myApp'], { strictDi: true });
//   })
//   .catch(err => console.error(err));


// platformBrowserDynamic().bootstrapModule(AppModule).then(platformRef => {
//   console.log('Bootstrap both Angular and AngularJS ');
//   const upgrade = platformRef.injector.get(UpgradeModule) as UpgradeModule;
//   upgrade.bootstrap(document.body, ['myApp'], { strictDi: true });
// });