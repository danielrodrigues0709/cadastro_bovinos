import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { VacinaVermifugo } from 'src/app/interfaces/vacina-vermifugo';
import { VacinacaoVermifugacao } from 'src/app/interfaces/vacinacao-vermifugacao';
import { AnimaisService } from 'src/app/services/animais.service';
import { VacinacoesService } from 'src/app/services/vacinacoes.service';
import { VacinasService } from 'src/app/services/vacinas.service';
import { vacinaVermifugo } from 'src/app/utils/enums';
import { CadastroVacinacaoComponent } from '../cadastro-vacinacao/cadastro-vacinacao.component';

@Component({
  selector: 'app-vacinacoes',
  templateUrl: './vacinacoes.component.html',
  styleUrls: ['./vacinacoes.component.scss'],
  providers: [DialogService, ConfirmationService, MessageService]
})
export class VacinacoesComponent implements OnInit {

  vacinacoes: VacinacaoVermifugacao[] = [];
  vermifugacoes: VacinacaoVermifugacao[] = [];
  vacinas: VacinaVermifugo[] = [];
  vermifugas: VacinaVermifugo[] = [];

  constructor(
    private _vacinacoesService: VacinacoesService,
    private _animaisService: AnimaisService,
    private _vacinasService: VacinasService,
    public dialogService: DialogService,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    private _confirmationService: ConfirmationService,
    private _messageService: MessageService
  ) { }

  ngOnInit() {
    this.getVacinacoes();
    this.getVermifugacoes();
  }

  getVacinacoes():void {
    let params = {
      tipo: vacinaVermifugo.Vacina,
    }
    this._vacinacoesService.getVacinacoes(params).pipe().subscribe(res => {
      this.vacinacoes = res.rows;
      this.getDataById(res.rows);
    });
  }

  getVermifugacoes():void {
    let params = {
      tipo: vacinaVermifugo.Vermifugo,
    }
    this._vacinacoesService.getVacinacoes(params).pipe().subscribe(res => {
      this.vermifugacoes = res.rows;
      this.getDataById(res.rows);
    });
  }

  getDataById(vacinacoes: VacinacaoVermifugacao[]): void {
    vacinacoes.forEach((inseminacao, index) => {
      this._animaisService.getAnimalById(inseminacao.id_animal).subscribe(res => {
        vacinacoes[index] = Object.assign(vacinacoes[index], {
          animal: res.rows[0]
        });
        this.vacinacoes = vacinacoes;
      });
    });
    // TODO Implementar getVacinaById
    // vacinacoes.forEach((inseminacao, index) => {
    //   this._vacinasService.getVacinaById(inseminacao.id_vacina).subscribe(res => {
    //     vacinacoes[index] = Object.assign(vacinacoes[index], {
    //       vacina: res.rows[0]
    //     });
    //     this.vacinacoes = vacinacoes;
    //   });
    // })
  }

  edit(element: any): void {
    const ref = this.dialogService.open(CadastroVacinacaoComponent, {
      data: element,
      header: `Editar Vacina/Vermífugo`,
      width: '90%'
    })
    .onClose.subscribe(() => {
      this.getVacinacoes();
      this.getVermifugacoes();
    });
  }

  delete(id: number): void {
    this._confirmationService.confirm({
      message: 'Deseja deletar o registro?',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      rejectButtonStyleClass: 'p-button-outlined',
      accept: () => {
        this._vacinacoesService.deleteVacinacao(id).subscribe(res => {
          this._messageService.add({severity:'success', detail: res.message});
          this.getVacinacoes();
          this.getVermifugacoes();
        },
        err => this._messageService.add({severity:'error', detail: err.error.message}))
      }
    });
  }

  include(): void {
    const ref = this.dialogService.open(CadastroVacinacaoComponent, {
      data: { },
      header: `Nova Vacina/Vermífugo`,
      width: '90%'
    })
    .onClose.subscribe(() => {
      this.getVacinacoes();
      this.getVermifugacoes();
    });
  }

}