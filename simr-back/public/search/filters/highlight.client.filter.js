"use strict";

/**
 * Filtro para resaltar términos de búsqueda en texto
 */
angular.module("search").filter("highlight", [
  function () {
    return function (text, searchQuery) {
      // Si no hay texto o query, retornar el texto original
      if (!text || !searchQuery) {
        return text;
      }

      // Convertir a string si no lo es
      text = String(text);
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

      // Si no hay términos, retornar texto original
      if (terms.length === 0) {
        return text;
      }

      // Construir patrón regex para todos los términos
      // Escapar caracteres especiales de regex
      var escapedTerms = terms.map(function (term) {
        return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      });

      // Crear regex que busque cualquiera de los términos (case insensitive)
      var pattern = new RegExp("(" + escapedTerms.join("|") + ")", "gi");

      // Reemplazar coincidencias con HTML resaltado
      var highlighted = text.replace(pattern, function (match) {
        return '<mark class="search-highlight">' + match + "</mark>";
      });

      return highlighted;
    };
  },
]);
