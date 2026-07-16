"use strict";

/**
 * Filtro para resaltar términos de búsqueda en texto
 *
 * NOTA DE SEGURIDAD (XSS corregido):
 * Este filtro se usa junto con `ng-bind-html` + `$sce.trustAsHtml()` en
 * `search.client.controller.js`, sin `ngSanitize` cargado (no se usa en
 * esta app). Antes de esta corrección, el texto proveniente de la base
 * de datos (títulos, descripciones, etc.) o del propio término de
 * búsqueda del usuario se insertaba SIN escapar en el HTML resultante,
 * permitiendo XSS almacenado/reflejado si ese texto contenía HTML/JS
 * (p.ej. `<img src=x onerror=...>`). Ahora se escapan las entidades
 * HTML del texto ANTES de aplicar el resaltado, de modo que lo único
 * que se inserta como HTML real son las etiquetas `<mark>` que este
 * mismo filtro genera.
 */
angular.module("search").filter("highlight", [
  function () {
    // Escapa entidades HTML para evitar inyección de markup/JS.
    function escapeHtml(value) {
      return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    return function (text, searchQuery) {
      // Si no hay texto o query, retornar el texto (igualmente escapado,
      // ya que de todos modos se renderiza como HTML vía ng-bind-html).
      if (!text) {
        return text;
      }
      text = escapeHtml(String(text));

      if (!searchQuery) {
        return text;
      }

      searchQuery = String(searchQuery);

      // Extraer términos de búsqueda significativos
      // Remover operadores booleanos y paréntesis
      var cleanQuery = searchQuery
        .replace(/\(|\)/g, " ")
        .replace(/\s+(AND|OR|NOT)\s+/gi, " ");

      // Extraer frases entre comillas
      var phrases = [];
      var phraseRegex = /"([^"]+)"/g;
      var match;
      while ((match = phraseRegex.exec(cleanQuery)) !== null) {
        phrases.push(match[1]);
      }

      // Remover las frases con comillas del query
      cleanQuery = cleanQuery.replace(/"[^"]+"/g, "");

      // Dividir en palabras individuales y combinar con las frases
      var terms = cleanQuery
        .split(/\s+/)
        .filter(function (term) {
          return term.trim().length > 0;
        })
        .concat(phrases);

      // Si no hay términos, retornar texto (ya escapado)
      if (terms.length === 0) {
        return text;
      }

      // Construir patrón regex para todos los términos
      // Escapar caracteres especiales de regex (y, por consistencia,
      // sobre el término ya escapado como HTML también, ya que el texto
      // contra el que se compara ahora está escapado).
      var escapedTerms = terms
        .map(function (term) {
          return escapeHtml(term);
        })
        .map(function (term) {
          return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        });

      // Crear regex que busque cualquiera de los términos (case insensitive)
      var pattern = new RegExp("(" + escapedTerms.join("|") + ")", "gi");

      // Reemplazar coincidencias con HTML resaltado. En este punto "text"
      // ya está escapado, por lo que "match" nunca puede contener markup
      // real: lo único que se inserta como HTML es la etiqueta <mark>.
      var highlighted = text.replace(pattern, function (match) {
        return '<mark class="search-highlight">' + match + "</mark>";
      });

      return highlighted;
    };
  },
]);
