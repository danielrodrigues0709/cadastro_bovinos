import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Ocorrencia } from 'src/app/interfaces/ocorrencia';
import { AnimaisService } from 'src/app/services/animais.service';
import { MedicamentosService } from 'src/app/services/medicamentos.service';
import { OcorrenciasService } from 'src/app/services/ocorrencias.service';

@Component({
  selector: 'app-cadastro-ocorrencia',
  templateUrl: './cadastro-ocorrencia.component.html',
  styleUrls: ['./cadastro-ocorrencia.component.scss']
})
export class CadastroOcorrenciaComponent implements OnInit {

  ocorrencia!: Ocorrencia;
  editMode!: boolean;
  form!: FormGroup;
  animaisOptions: any[] = [];
  medicamentosOptions: any[] = [];

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private _fb: FormBuilder,
    private _ocorrenciaService: OcorrenciasService,
    private _animalService: AnimaisService,
    private _medicamentoService: MedicamentosService,
    private _messageService: MessageService
  ) {
    this.ocorrencia = this.config.data;
    this.editMode = this.ocorrencia.id ? false : true;

    this.createform();
  }

  ngOnInit(): void {
    this.setFormValues(this.ocorrencia);
    this.ocorrencia.id ? this.form.disable() : this.form.enable();
  }

  autocompleteAnimal(event: any): void {
    let params: any = {};
    params.nomeAnimal = event.query;
    this._animalService.getAnimais(params).subscribe(res => {
      this.animaisOptions = res.rows;
    })
  }

  autocompleteMedicamento(event: any): void {
    let medicamento = event.query;
    this._medicamentoService.getMedicamentosByDesc(medicamento).subscribe(res => {
      this.medicamentosOptions = res.rows;
    })
  }

  onSelectAnimal(event: any): void {
    this.form.get('numControle')?.patchValue(event.nro_controle)
  }

  createform(): void {
    this.form = this._fb.group({
      numControle: ['', Validators.required],
      animal: ['', Validators.required],
      data_ocorrencia: ['', Validators.required],
      morte: ['', Validators.required],
      medicamento: ['', Validators.required],
      descricao: ['', Validators.required]
    })
  }

  setFormValues(element: any): void {
    this.form.patchValue({
      numControle: element?.animal,
      animal: element?.animal,
      data_ocorrencia: new Date(element?.data_ocorrencia),
      morte: element?.morte,
      medicamento: element?.medicamento,
      descricao: element?.descricao
    })
  }

  edit(): void {
    this.editMode = true;
    this.form.enable();
  }

  cancel(goBack: boolean): void {
    if(goBack) {
      this.ref.close();
    }
    else {
      this.form.patchValue({
        ...this.ocorrencia
      });
      this.editMode = false;
      this.form.disable();
    }
  }

  submit(): void {
    if(!this.form.valid) {
      return;
    }
    let formValue = this.form.value;
    let params = { 
      ...formValue,
      id_animal: formValue.animal.id,
      id_medicamento: formValue.medicamento.id
    }
    
    if(this.ocorrencia.id) {
      this._ocorrenciaService.updateOcorrencia(this.ocorrencia.id, params).subscribe(res => {
        this._messageService.add({severity:'success', detail: res.message});
        this.ref.close();
      },
      err => {
        this._messageService.add({severity:'error', detail: err.error.message});
      })
    }
    else {
      this._ocorrenciaService.saveOcorrencia(params).subscribe(res => {
        this._messageService.add({severity:'success', detail: res.message});
        this.ref.close();
      },
      err => {
        this._messageService.add({severity:'error', detail: err.error.message});
      })
    }
  }

}
