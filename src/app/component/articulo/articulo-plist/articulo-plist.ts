import { Component } from '@angular/core';
import { IArticulo } from '../../../model/articulo';
import { IPage } from '../../../model/plist';
import { ArticuloService } from '../../../service/articulo';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-articulo-plist',
  imports: [],
  templateUrl: './articulo-plist.html',
  styleUrl: './articulo-plist.css',
})
export class AdminPlist {

  oPage: IPage<IArticulo> | null = null;
  numPage: number = 0;
  numRpp: number = 5;
  rellenaCantidad: number = 10;
  rellenando: boolean = false;
  rellenaOk: number | null = null;
  rellenaError: string | null = null;
  publishingId: number | null = null;
  publishingAction: 'publicar' | 'despublicar' | null = null;
  sortField: string = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';
  emptying: boolean = false;
  emptyOk: number | null = null;
  emptyError: string | null = null;

  // Mensajes y total
  message: string | null = null;
  totalRecords: number = 0;
  private messageTimeout: any = null;

  constructor(private oArticuloService: ArticuloService, private route: ActivatedRoute) { }

  oBotonera: string[] = [];
  orderField: string = 'id';
  orderDirection: string = 'asc';

  ngOnInit() {
    const msg = this.route.snapshot.queryParamMap.get('msg');
    if (msg) {
      this.showMessage(msg);
    }
    this.getPage();
  }

  private showMessage(msg: string, duration: number = 4000) {
    this.message = msg;
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
    this.messageTimeout = setTimeout(() => {
      this.message = null;
      this.messageTimeout = null;
    }, duration);
  }

  getPage() {
    this.oArticuloService.getPage(this.numPage, this.numRpp, this.orderField, this.orderDirection).subscribe({
      next: (data: IPage<IArticulo>) => {
        this.oPage = data;
        this.totalRecords = data?.totalElements ?? 0;
        // si estamos en una página que supera el límite entonces nos situamos en la ultima disponible
        if (this.numPage > 0 && this.numPage >= data.totalPages) {
          this.numPage = data.totalPages - 1;
          this.getPage();
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  onOrder(order: string) {
    if (this.orderField === order) {
      this.orderDirection = this.orderDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.orderField = order;
      this.orderDirection = 'asc';
    }
    this.numPage = 0;
    this.getPage();
    return false;
  }

  goToPage(numPage: number) {
    this.numPage = numPage;
    this.getPage();
    return false;
  }

  onRppChange(n: number) {
    this.numRpp = n;
    this.getPage();
    return false;
  }

  onCantidadChange(value: string) {
    this.rellenaCantidad = +value;
    return false;
  }

  sortBy(field: string) {
    if (this.sortField === field) {
      // toggle direction
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.getPage();
    return false;
  }

  // publicar(id: number) {
  //   this.publishingId = id;
  //   this.publishingAction = 'publicar';
  //   this.oArticuloService.publicar(id).subscribe({
  //     next: () => {
  //       this.publishingId = null;
  //       this.publishingAction = null;
  //       this.getPage();
  //     },
  //     error: (err: HttpErrorResponse) => {
  //       console.error(err);
  //       this.publishingId = null;
  //       this.publishingAction = null;
  //     }
  //   });
  //   return false;
  // }

  // despublicar(id: number) {
  //   this.publishingId = id;
  //   this.publishingAction = 'despublicar';
  //   this.oArticuloService.despublicar(id).subscribe({
  //     next: () => {
  //       this.publishingId = null;
  //       this.publishingAction = null;
  //       this.getPage();
  //     },
  //     error: (err: HttpErrorResponse) => {
  //       console.error(err);
  //       this.publishingId = null;
  //       this.publishingAction = null;
  //     }
  //   });
  //   return false;
  // }

}
