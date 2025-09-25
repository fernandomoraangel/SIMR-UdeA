import { Component, signal, effect, computed } from '@angular/core';

interface Tarea {
  id: number;
  texto: string;
  completada: boolean;
}

@Component({
  template: `
    <div>
      <h2>Lista de Tareas</h2>

      <input
        #nuevaTarea
        (keyup.enter)="agregarTarea(nuevaTarea.value); nuevaTarea.value = ''"
      />
      <button (click)="agregarTarea(nuevaTarea.value); nuevaTarea.value = ''">
        Agregar
      </button>

      <p>Total: {{ totalTareas() }} | Completadas: {{ tareasCompletadas() }}</p>

      <ul>
        @for (tarea of tareas(); track tarea) {
        <li>
          <input
            type="checkbox"
            [checked]="tarea.completada"
            (change)="toggleTarea(tarea.id)"
          />
          <span [class.tachado]="tarea.completada">{{ tarea.texto }}</span>
          <button (click)="eliminarTarea(tarea.id)">❌</button>
        </li>
        }
      </ul>
    </div>
  `,
  styles: ['.tachado { text-decoration: line-through; }'],
})
export class ListaTareasComponent {
  tareas = signal<Tarea[]>([]);
  private siguienteId = 1;

  // Computed signals
  totalTareas = computed(() => this.tareas().length);
  tareasCompletadas = computed(
    () => this.tareas().filter((t) => t.completada).length
  );

  constructor() {
    // Effect para guardar en localStorage
    effect(() => {
      localStorage.setItem('tareas', JSON.stringify(this.tareas()));
    });

    // Cargar tareas al inicializar
    const tareasGuardadas = localStorage.getItem('tareas');
    if (tareasGuardadas) {
      this.tareas.set(JSON.parse(tareasGuardadas));
    }
  }

  agregarTarea(texto: string) {
    if (texto.trim()) {
      this.tareas.update((tareas) => [
        ...tareas,
        { id: this.siguienteId++, texto: texto.trim(), completada: false },
      ]);
    }
  }

  toggleTarea(id: number) {
    this.tareas.update((tareas) =>
      tareas.map((t) => (t.id === id ? { ...t, completada: !t.completada } : t))
    );
  }

  eliminarTarea(id: number) {
    this.tareas.update((tareas) => tareas.filter((t) => t.id !== id));
  }
}
