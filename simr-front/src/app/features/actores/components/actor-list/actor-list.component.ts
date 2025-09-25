import { Component } from '@angular/core';
import { Actor } from '../../models/actor.interface';
import { ActoresService } from '../../services/actores.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-actor-list',
  templateUrl: './actor-list.component.html',
  styleUrl: './actor-list.component.css',
  standalone: false,
})
export class ActorListComponent {
  actores: Actor[] = [];

  constructor(private actoresService: ActoresService, private router: Router) {}

  ngOnInit(): void {
    this.getActores();
  }

  getActores(): void {
    this.actoresService
      .getActores()
      .subscribe((actores) => (this.actores = actores));
  }

  addActor(actor: Actor): void {
    this.actoresService.addActor(actor).subscribe({
      next: (newActor) => {
        this.actores.push(newActor);
        console.log('Actor creado:', newActor);
        // Redirigir a la página de lista de actores después de crear un actor
        this.router.navigate(['/actores']);
      },
      error: (error) => {
        console.error('Error al crear actor:', error);
      },
      complete: () => {
        console.log('Creación de actor completada.');
      },
    });
  }

  updateActor(actor: Actor): void {
    this.actoresService.updateActor(actor._id!, actor).subscribe();
  }

  deleteActor(actor: Actor): void {
    this.actoresService
      .deleteActor(actor._id!)
      .subscribe(
        () => (this.actores = this.actores.filter((a) => a !== actor))
      );
  }

  // deleteActor(id: string): void {
  //   this.actoresService.deleteActor(id).subscribe(() => {
  //     this.actors = this.actors.filter(actor => actor._id !== id);
  //   });
  // }
}
