validarFecha = function (fecha, id) {
  const regex = /^(\d{4}|0)\/([0-9][0-9]|0)\/([0-9][0-9]|0)/;
  if (regex.test(fecha)) {
    document.getElementById(id).style = "color:black";
  } else {
    Swal.fire({
      title: "Formato de fecha incorrecto",
      text: "El formato correcto es YYYY/MM/DD, si desea no incluir alguno de estos datos, reemplacelo con 0, ej. 2012/20/0",
      icon: "error",
      confirmButtonText: "ok",
    });
    document.getElementById(id).style = "color:red";
  }
};

validarUrloRuta = function (url, id) {
  // Expresión regular para validar URLs
  let regexUrl =
    /https?:\/\/([a-zA-Z0-9]([^ @&%$\\\/()=?¿!.,:;]|\d)*[a-zA-Z0-9][\.])+[a-zA-Z]{2,4}([\.][a-zA-Z]{2})?\/?((?<=\/)(([^ @&$#\\\/()+=?¿!,:;'&quot;^´*%|]|\d)+[\/]?)*(#(?<=#)[^ @&$#\\\/()+=?¿!,:;'&quot;^´*%|]*)?(\?(?<=\?)([^ @&$#\\\/()+=?¿!,:;'&quot;^´*|]+[=][^ @&$#\\\/()+=?¿!,:;'&quot;^´*|]+(&(?<=&)[^ @&$#\\\/()+=?¿!,:;'&quot;^´*|]+[=][^ @&$#\\\/()+=?¿!,:;'&quot;^´*|]+)*))?)?/;
  // Expresión regular para validar direcciones de computadora
  let regexDireccion = /^(?:[a-zA-Z]:|\/|\\)[^:\n\r]+[^:\n\r\/\\]*$/;

  if (regexDireccion.test(url) | regexUrl.test(url)) {
    document.getElementById(id).style = "color:black";
    //Verificar si la url existe
  } else {
    Swal.fire({
      title: "Formato incorrecto",
      text: "El texto ingresado no es una url o una ruta de archivo válida. Verifíquelo antes de utilizarlo. Recuerde que debe escribir urls absolutas y completas",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Conservar el texto",
      cancelButtonText: "Borrar el texto",
    }).then((result) => {
      if (result.isConfirmed) {
        document.getElementById(id).style = "color:red";
      } else {
        document.getElementById(id).value = "";
      }
    });
  }
};

//Validar número
esEnteroPositivo = function (n, id) {
  const regex = /^[0-9]+$/;
  if (regex.test(n)) {
    document.getElementById(id).style = "color:black";
  } else {
    Swal.fire({
      title: "Entrada incorrecta",
      text: "La cantidad debe ser un entero positivo",
      icon: "error",
      confirmButtonText: "ok",
    });
    document.getElementById(id).style = "color:red";
  }
};
//Función para calcular la precisión de una fecha

precisionFecha = function (fecha = "") {
  if (fecha == "") {
    return "";
  }
  var arr = fecha.split("/");
  var ano = arr[0];
  var mes = arr[1];
  var dia = arr[2];
  var precision = "AMD";
  if (ano == 0) {
    precision = precision.replace("A", "");
    ano = 3000;
  }
  if (mes == 0) {
    precision = precision.replace("M", "");
    mes = 1;
  }
  if (dia == 0) {
    precision = precision.replace("D", "");
    dia = 1;
  }
  var fechayPrecision = new Object();
  fechayPrecision.fecha = ano + "/" + mes + "/" + dia;
  fechayPrecision.precision = precision;
  return fechayPrecision;
};

//Función para mostrar las fechas con una precisión dada
formatDate = function (date, precision = "AMD") {
  const fechaActual = new Date(date);
  //var opciones = {month: 'long', day: 'numeric' };
  var opciones = new Object();

  if (precision.indexOf("A") != -1) {
    opciones["year"] = "numeric";
  }

  if (precision.indexOf("M") != -1) {
    opciones["month"] = "long";
  }

  if (precision.indexOf("D") != -1) {
    opciones["day"] = "numeric";
  }
  return fechaActual.toLocaleDateString("es-MX", opciones);
};

//Función para mostrar las fechas con una precisión dada
formatDateYMD = function (date, precision) {
  const fechaActual = new Date(date);
  //var opciones = { year: "numeric", month: "long", day: "numeric" };
  var opciones = new Object();
  year = 0;
  month = 0;
  day = 0;
  if (precision.indexOf("A") != -1) {
    year = fechaActual.getFullYear();
  }

  if (precision.indexOf("M") != -1) {
    month = fechaActual.getMonth() + 1;
  }

  if (precision.indexOf("D") != -1) {
    day = fechaActual.getDate();
  }
  //Convertir a 2 dígitos
  return (
    year +
    "/" +
    (month > 0 && month < 10 ? "0" + month : month) +
    "/" +
    (day > 0 && day < 10 ? "0" + day : day)
  );
};

//Función para mostrar las fechas con una precisión dada en el campo editable
formatDateforEdit = function (date, precision) {
  var arr = date.split("/");
  var year = arr[0];
  var month = arr[1];
  var day = arr[2];

  if (precision.indexOf("A") == -1) {
    year = 0;
  }

  if (precision.indexOf("M") == -1) {
    month = 0;
  }

  if (precision.indexOf("D") == -1) {
    day = 0;
  }
  return year + "/" + month + "/" + day;
};

nombrarSi = function (nombre, x) {
  if (x === "undefined" || x === "" || x === undefined) {
    return;
  } else {
    if (nombre != "") {
      return " " + nombre + ": " + x;
    } else {
      return " " + x;
    }
  }
};
