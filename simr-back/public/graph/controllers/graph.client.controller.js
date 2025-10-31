"use strict";

// Controlador principal del grafo de base de datos
angular.module("graph").controller("GraphController", [
  "$scope",
  "$timeout",
  "$location",
  "GraphService",
  "Authentication",
  function ($scope, $timeout, $location, GraphService, Authentication) {
    var vm = this;

    // Inicialización
    vm.authentication = Authentication;
    vm.isLoading = false;
    vm.error = null;
    vm.graphData = null;
    vm.metadata = null;
    vm.searchQuery = "";

    // Opciones de visualización
    vm.selectedEntities = [];
    vm.availableEntities = [];
    vm.showFilters = true;

    // Colores de entidades
    vm.entityColors = {};

    // Referencias D3
    var svg, g, simulation, link, node, label;
    var width = 900;
    var height = 600;

    // Cargar metadatos al inicializar
    loadMetadata();

    // Función para cargar metadatos
    function loadMetadata() {
      GraphService.getMetadata()
        .then(function (response) {
          if (response.success) {
            vm.metadata = response.metadata;
            vm.availableEntities = response.metadata.availableEntities || [];
            vm.entityColors = response.metadata.colors || {};
          }
        })
        .catch(function (error) {
          console.error("Error cargando metadatos:", error);
        });
    }

    // Función principal para cargar el grafo
    vm.loadGraph = function () {
      if (vm.selectedEntities.length === 0) {
        vm.error = "Por favor selecciona al menos una entidad para visualizar";
        return;
      }

      vm.isLoading = true;
      vm.error = null;

      var options = {
        entities: vm.selectedEntities,
        query: vm.searchQuery || null,
        limit: 100,
      };

      GraphService.getGraphData(options)
        .then(function (response) {
          console.log("[GRAPH] Respuesta recibida:", response);
          if (response.success) {
            vm.graphData = response.data;
            console.log("[GRAPH] Datos del grafo:", vm.graphData);
            console.log("[GRAPH] Nodos:", vm.graphData.nodes.length);
            console.log("[GRAPH] Enlaces:", vm.graphData.links.length);

            // Usar $timeout para asegurar que Angular haya renderizado el DOM
            $timeout(function () {
              renderGraph(response.data);
            }, 100);
          } else {
            vm.error = response.message || "Error cargando datos del grafo";
          }
          vm.isLoading = false;
        })
        .catch(function (error) {
          console.error("[GRAPH] Error en getGraphData:", error);
          vm.error =
            "Error al cargar el grafo: " +
            (error.data ? error.data.message : error.message);
          vm.isLoading = false;
        });
    };

    // Función para renderizar el grafo con D3.js
    function renderGraph(data) {
      console.log("[GRAPH] Iniciando renderGraph con datos:", data);

      // Limpiar SVG existente
      d3.select("#graph-container").selectAll("*").remove();

      if (!data.nodes || data.nodes.length === 0) {
        vm.error = "No hay datos para visualizar con los filtros seleccionados";
        console.error("[GRAPH] No hay nodos para visualizar");
        return;
      }

      console.log("[GRAPH] Seleccionando contenedor...");
      var container = d3.select("#graph-container");
      console.log("[GRAPH] Contenedor seleccionado:", container.node());

      if (!container.node()) {
        console.error(
          "[GRAPH] ERROR: Contenedor #graph-container no encontrado"
        );
        vm.error = "Error: Contenedor del grafo no encontrado";
        return;
      }

      // Obtener dimensiones del contenedor
      var containerNode = container.node();
      width = containerNode.clientWidth || 900;
      height = containerNode.clientHeight || 600;
      console.log("[GRAPH] Dimensiones del contenedor:", width, "x", height);

      // Crear SVG
      console.log("[GRAPH] Creando SVG...");
      svg = container
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(
          d3.zoom().on("zoom", function (event) {
            g.attr("transform", event.transform);
          })
        );

      g = svg.append("g");

      // Crear simulación de fuerza
      simulation = d3
        .forceSimulation(data.nodes)
        .force(
          "link",
          d3
            .forceLink(data.links)
            .id(function (d) {
              return d.id;
            })
            .distance(100)
        )
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(30));

      // Crear enlaces
      link = g
        .append("g")
        .selectAll("line")
        .data(data.links)
        .enter()
        .append("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 2);

      // Crear nodos
      node = g
        .append("g")
        .selectAll("circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("r", 10)
        .attr("fill", function (d) {
          return d.color || "#999";
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .call(drag(simulation))
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .on("click", handleClick);

      // Crear etiquetas
      label = g
        .append("g")
        .selectAll("text")
        .data(data.nodes)
        .enter()
        .append("text")
        .text(function (d) {
          return d.label;
        })
        .attr("font-size", "10px")
        .attr("dx", 12)
        .attr("dy", 4)
        .attr("pointer-events", "none");

      console.log("[GRAPH] Grafo renderizado exitosamente");
      console.log("[GRAPH] Nodos creados:", data.nodes.length);
      console.log("[GRAPH] Enlaces creados:", data.links.length);

      // Actualizar posiciones en cada tick
      simulation.on("tick", function () {
        link
          .attr("x1", function (d) {
            return d.source.x;
          })
          .attr("y1", function (d) {
            return d.source.y;
          })
          .attr("x2", function (d) {
            return d.target.x;
          })
          .attr("y2", function (d) {
            return d.target.y;
          });

        node
          .attr("cx", function (d) {
            return d.x;
          })
          .attr("cy", function (d) {
            return d.y;
          });

        label
          .attr("x", function (d) {
            return d.x;
          })
          .attr("y", function (d) {
            return d.y;
          });
      });
    }

    // Función de arrastre
    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    // Manejador de mouseover
    function handleMouseOver(event, d) {
      // Resaltar nodo
      d3.select(event.currentTarget)
        .transition()
        .duration(200)
        .attr("r", 15)
        .attr("stroke-width", 3);

      // Mostrar tooltip
      showTooltip(event, d);
    }

    // Manejador de mouseout
    function handleMouseOut(event, d) {
      d3.select(event.currentTarget)
        .transition()
        .duration(200)
        .attr("r", 10)
        .attr("stroke-width", 2);

      hideTooltip();
    }

    // Manejador de click
    function handleClick(event, d) {
      console.log("Nodo clickeado:", d);
      // Aquí se puede agregar navegación al detalle del nodo
      var url = getEntityUrl(d);
      if (url) {
        window.location.href = url;
      }
    }

    // Obtener URL de la entidad
    function getEntityUrl(node) {
      var baseUrls = {
        Obra: "#!/obras/",
        Actor: "#!/actores/",
        Recurso: "#!/recursos/",
        Genero: "#!/generos/",
        GeneroNoMusical: "#!/generosnomusicales/",
        Materia: "#!/materias/",
        Instrumento: "#!/instrumentos/",
        Proyecto: "#!/proyectos/",
        Medio: "#!/medios/",
        Sistema: "#!/sistemas/",
        Fondo: "#!/fondos/",
        Coleccion: "#!/colecciones/",
        Ejemplar: "#!/ejemplares/",
        Idioma: "#!/idiomas/",
        Diccionario: "#!/diccionarios/",
        Archivo: "#!/archivos/",
        Lista: "#!/listas/",
      };

      if (node.entityType && node.entityId) {
        var baseUrl = baseUrls[node.entityType];
        if (baseUrl) {
          return baseUrl + node.entityId;
        }
      }
      return null;
    }

    // Mostrar tooltip
    function showTooltip(event, d) {
      var tooltip = d3.select("#graph-tooltip");
      tooltip
        .style("display", "block")
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 10 + "px")
        .html(
          "<strong>" +
            d.label +
            "</strong><br/>" +
            "Tipo: " +
            d.entityType +
            "<br/>" +
            "ID: " +
            d.entityId
        );
    }

    // Ocultar tooltip
    function hideTooltip() {
      d3.select("#graph-tooltip").style("display", "none");
    }

    // Funciones de filtro
    vm.toggleEntity = function (entity) {
      var index = vm.selectedEntities.indexOf(entity);
      if (index > -1) {
        vm.selectedEntities.splice(index, 1);
      } else {
        vm.selectedEntities.push(entity);
      }
    };

    vm.isEntitySelected = function (entity) {
      return vm.selectedEntities.indexOf(entity) > -1;
    };

    vm.selectAllEntities = function () {
      vm.selectedEntities = angular.copy(vm.availableEntities);
    };

    vm.clearEntitySelection = function () {
      vm.selectedEntities = [];
    };

    vm.getEntityDisplayName = function (entity) {
      var displayNames = {
        Obra: "Obras",
        Actor: "Actores",
        Recurso: "Recursos",
        Genero: "Géneros",
        GeneroNoMusical: "Géneros No Musicales",
        Materia: "Materias",
        Instrumento: "Instrumentos",
        Proyecto: "Proyectos",
        Medio: "Medios",
        Sistema: "Sistemas",
        Fondo: "Fondos",
        Coleccion: "Colecciones",
        Ejemplar: "Ejemplares",
        Idioma: "Idiomas",
        Diccionario: "Diccionarios",
        Archivo: "Archivos",
        Lista: "Listas",
      };
      return displayNames[entity] || entity;
    };

    // Limpiar grafo
    vm.clearGraph = function () {
      d3.select("#graph-container").selectAll("*").remove();
      vm.graphData = null;
      vm.searchQuery = "";
      vm.error = null;
    };
  },
]);
