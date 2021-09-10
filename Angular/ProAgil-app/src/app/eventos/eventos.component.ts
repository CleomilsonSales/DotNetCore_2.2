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
  eventos: any;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getEventos();
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
