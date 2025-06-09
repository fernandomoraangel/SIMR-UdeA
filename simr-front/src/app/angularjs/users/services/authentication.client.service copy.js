// ============== ORIGINAL CODE =================
// angular.module("users").factory("Authentication", [
//   function () {
//     this.user = window.user;
//     return {
//       user: this.user,
//     };
//   },
// ]);
// ============== (Fin de ORIGINAL CODE) =================

angular.module("users").factory("Authentication", [
  function () {
    try {
      let userInfo = JSON.parse(localStorage.getItem("user"));
      if (!userInfo) {
        // Si no hay usuario en localStorage, redirigir a la página de inicio de sesión
        console.log("User not authenticated, redirecting to login page.");
        alert("No tienes acceso a esta aplicación. Por favor, inicia sesión.");
        // window.location.href = `http://localhost:4200/signin`;
        window.location.href = `http://localhost:4200/`;
      } else {
        console.log("User authenticated, no redirection needed.");
        alert("Bienvenido a la aplicación SIMR.");
        // this.user = window.user;
        this.user = userInfo;
        return {
          user: this.user,
        };

      }
    } catch (error) {
      console.error("Error parsing user info from localStorage:", error);
    }
  },
]);


// angular.module("users").factory("Authentication", [
// function () {
// // Extraer el token de la URL
// const params = new URLSearchParams(window.location.search);
// const token = params.get('token');
// console.log("Token from URL: ", token);

// if (token) {
//   console.log("Token found in URL, user authenticated.");
//   // Guardar el token en localStorage de esta aplicación
//   localStorage.setItem('authToken', token);

//   this.user = window.user;
//   return {
//     user: this.user,
//   };

//   // Limpiar la URL (opcional)
//   window.history.replaceState({}, document.title, window.location.pathname);
// } else {
//   console.log("User not authenticated, redirecting to login page.");
//   alert("No tienes acceso a esta aplicación. Por favor, inicia sesión.");
//   window.location.href = `http://localhost:4200/signin`;
// }



// if (!localStorage.getItem("user")) {
//   if (!token) {
//     console.log("User not authenticated, redirecting to login page.");
//     alert("No tienes acceso a esta aplicación. Por favor, inicia sesión.");
//     window.location.href = `http://localhost:4200`;
//   }
//   // window.history.replaceState({}, document.title, window.location.pathname);
//   // $location.path("/login");
// } else {
//   console.log("User authenticated, no redirection needed.");
//   alert("Bienvenido a la aplicación SIMR.");
// }
// },
// ]);