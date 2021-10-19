import { Component, OnInit, TemplateRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EventoService } from '../_services/evento.service';
import { Evento } from '../_models/Evento';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
// Defindo o date picker em formarto pt-Br
import { defineLocale, BsLocaleService, ptBrLocale } from 'ngx-bootstrap';
import { ToastrService } from 'ngx-toastr';
defineLocale('pt-br', ptBrLocale);


@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.css']
})
export class EventosComponent implements OnInit {
  titulo='Eventos';

  eventosFiltrados: Evento[];
  eventos: Evento[];

  evento: Evento;
  modoSalvar = 'post';

  imagemLargura = 50;
  imagemMargem = 2;
  mostrarImagem = false;
  registerForm: FormGroup;
  bodyDeletarEvento = '';

  file: File;
  fileNameToUpdate: string;
  dataAtual: string;

  // criado o get e set para não acessar a propriedade _filtroLista diretamente 
  _filtroLista = '';

  constructor(
    private eventoService: EventoService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private  localeService: BsLocaleService,
    private toastr: ToastrService
    ) {
      this.localeService.use('pt-br');
    }

    get filtroLista(): string {
      return this._filtroLista;
    }

    set filtroLista(value: string) {
      this._filtroLista = value;
      this.eventosFiltrados = this.filtroLista ? this.filtrarEventos(this.filtroLista) : this.eventos;
    }

    editarEvento(evento: Evento, template: any){
      this.modoSalvar = 'put';
      this.openModal(template);
      this.evento = Object.assign({}, evento);
      this.fileNameToUpdate = evento.imagemURL.toString();
      this.evento.imagemURL = '';
      // na linha abaixo eu preencho o formulário usando o patchValue usando os calores do evento da linha clicada
      this.registerForm.patchValue(this.evento);
    }

    novoEvento(template){
      this.modoSalvar = 'post';
      this.openModal(template);
    }

    excluirEvento(evento: Evento, template: any) {
      template.show();
      this.evento = evento;
      this.bodyDeletarEvento = `Tem certeza que deseja excluir o Evento: ${evento.tema}, Código: ${evento.id}`;
    }

    confirmeDelete(template: any) {
      this.eventoService.deleteEvento(this.evento.id).subscribe(
        () => {
            template.hide();
            this.getEventos();
            this.toastr.success('Deletado com sucesso');
          }, error => {
            this.toastr.error('Erro ao tentar deletar');
            console.log(error);
          }
      );
    }

    openModal(template: any) {
      this.registerForm.reset();
      template.show();
    }

    // o ngOnInit é executado antes da nossa interface ser implementada
    ngOnInit() {
      this.validation();
      this.getEventos();
    }

    filtrarEventos(filtrarPor: string): any {
      filtrarPor = filtrarPor.toLocaleLowerCase();
      return this.eventos.filter(
        evento => evento.tema.toLocaleLowerCase().indexOf(filtrarPor) !== -1
        );
      }

      alternarImagem() {
        this.mostrarImagem = !this.mostrarImagem ;
      }

      // configurando validadores
      validation() {
        this.registerForm = this.fb.group({
          tema: ['', [ Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
          local: ['', Validators.required],
          dataEvento: ['', Validators.required],
          imagemURL: ['', Validators.required],
          qtdPessoas: ['', [Validators.required, Validators.max(120000)]],
          telefone: ['', Validators.required],
          email: ['', [ Validators.required, Validators.email]]
        });
      }

      onFileChange(event) {
        const reader = new FileReader();
        // verifico se existe uma imagem com o if abaixo
        if (event.target.files && event.target.files.length){
          this.file = event.target.files;
          console.log(this.file);
        }
      }

      uploadImagem(){
        if (this.modoSalvar === 'post' ) {
          
          /*explicando o post do upload
          o sistema retornara "c:\fakepath\algo.jpg"
          o split era dividir em uma array de 3 posições com base na \
          ficará nomeArquivo: [c:, fakepath, algo.jpg]
          então eu pego a posição 2-algo.jpg
          */
          const nomeArquivo = this.evento.imagemURL.split('\\', 3);
          this.evento.imagemURL = nomeArquivo[2];
          // upload de imagem
          this.eventoService.postUpload(this.file, nomeArquivo[2])
            .subscribe(
              () => {
                this.dataAtual = new Date().getMilliseconds().toString();
                this.getEventos();
              }
            );
        } else {
          this.evento.imagemURL = this.fileNameToUpdate;
          this.eventoService.postUpload(this.file, this.fileNameToUpdate)
            .subscribe(
              () => {
                this.dataAtual = new Date().getMilliseconds().toString();
                this.getEventos();
              }
            );
        }
      }


      salvarAlteracao(template: any) {
        // primeiro checo se o form está válido (todos os campos preenchidos corretos)
        if (this.registerForm.valid) {
          if (this.modoSalvar === 'post' ) {
            // na linha abaixo eu atribuo a minha variável evento a funcionalidade do javascript Object.assign
            // onde pego todos os objetos do formulário 'registerForm'
            this.evento = Object.assign({}, this.registerForm.value);

            this.uploadImagem();

            // agora chamo meu método 'postEvento' localizado em '../_services/evento.service' e passo o Evento (this.evento)
            // que é meu formulário 
            this.eventoService.postEvento(this.evento).subscribe(
              (novoEvento: Evento) => {
                console.log(novoEvento);
                template.hide();
                this.getEventos();
                this.toastr.success('Inserido com sucesso!');
              }, error => {
                this.toastr.error('Erro ao inserir: ${error}');
                console.log(error);
              }
              );
            } else {
              this.evento = Object.assign({id: this.evento.id}, this.registerForm.value);

              this.uploadImagem();

              console.log('estou no Put');
              console.log(this.evento);

              this.eventoService.putEvento(this.evento).subscribe(
                () => {
                  template.hide();
                  this.getEventos();
                  this.toastr.success('Editado com sucesso!');
                }, error => {
                  this.toastr.error('Erro ao editar: ${error}');
                  console.log(error);
                }
              );
            }

          }// fim do if
        }// fim do método 'salvarAlteracao'

        getEventos() {
          // eventoService.getEvento() - ocaminho está direcionado em _services/eventoServices.ts
          // -> this.http.get('http://localhost:5000/api/values').subscribe
          this.eventoService.getAllEvento().subscribe(
            (_eventos: Evento[]) => {
              this.eventos = _eventos;
              this.eventosFiltrados = this.eventos;
              console.log(_eventos);
            }, error => {
              this.toastr.error('Erro ao carregar eventos: ${error}');
              console.log(error);
            });
          }

        }
