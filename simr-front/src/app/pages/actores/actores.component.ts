import { Component, OnInit } from '@angular/core';
import { ActorService } from '../../services/actor.service';
import { Actor } from '../../models/actor.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-actores',
  templateUrl: './actores.component.html',
  styleUrl: './actores.component.css'
})
export class ActoresComponent implements OnInit {
  actores: Actor[] = [];

  constructor(private actorService: ActorService, private router: Router) { }

  ngOnInit(): void {
    this.getActores();
  }

  getActores(): void {
    this.actorService.getActores().subscribe(actores => this.actores = actores);
  }

  addActor(actor: Actor): void {
    this.actorService.addActor(actor).subscribe({
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
      }
    });
  }

  updateActor(actor: Actor): void {
    this.actorService.updateActor(actor._id!, actor).subscribe();
  }

  deleteActor(actor: Actor): void {
    this.actorService.deleteActor(actor._id!).subscribe(() => this.actores = this.actores.filter(a => a !== actor));
  }

  // deleteActor(id: string): void {
  //   this.actorService.deleteActor(id).subscribe(() => {
  //     this.actors = this.actors.filter(actor => actor._id !== id);
  //   });
  // }

}
