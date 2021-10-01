import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.css']
})
export class EventosComponent implements OnInit {
  /* teste manual
  eventos: any = [
    {
      EventosId: 1,
      Tema: 'Angular',
      Local: 'Belo Horizonte'
    },
    {
      EventosId: 2,
      Tema: '.Net Core',
      Local: 'São Paulo'
    },
    {
      EventosId: 3,
      Tema: 'Angular e .Net Core',
      Local: 'Rio de Janeiro'
    }
  ]
  */

  _filtroLista: string = '';
  get filtroLista(): string{
    return this._filtroLista;
  }
  set filtroLista(value: string){
    this._filtroLista = value;
    this.eventosFiltrados = this.filtroLista ? this.filtraEvento(this.filtroLista) : this.eventos;
  }

  eventosFiltrados: any = [];
  eventos: any = [];
  imagemLargura = 50;
  imagemMargem = 2;
  mostrarImagem = false;  

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getEventos();
  }

  filtraEvento(filtrarPor: string) : any {
    filtrarPor = filtrarPor.toLocaleLowerCase();
    return this.eventos.filter(
      evento => evento.tema.toLocaleLowerCase().indexOf(filtrarPor) !== -1
    );
  }

  alternaImagem(){
    this.mostrarImagem = !this.mostrarImagem;
  }

  getEventos(){
    this.http.get('http://localhost:5000/api/values').subscribe(
      response => {
        this.eventos = response;
      }, error => {
        console.log(error);
      }
    );
  }

}
