import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Medicine } from 'src/app/Core/Models/medicine';
import { MedicineService } from 'src/app/Core/Services/medicine.service';

@Component({
  selector: 'app-medicine-details',
  templateUrl: './medicine-details.component.html',
  styleUrls: ['./medicine-details.component.scss'],
})
export class MedicineDetailsComponent {
  medicineDetails!: Medicine;

  constructor(
    private toast:ToastrService,
    private route: ActivatedRoute,
    private medicineService: MedicineService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.getMedicineDetails(+id);
    }
  }

  getMedicineDetails(id: number): void {
    this.medicineService
      .getMedicineById(id)
      .subscribe((medicine) => (this.medicineDetails = medicine));
  }
  formatExpiryDate(date: string): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date(date).toLocaleDateString(undefined, options);
  }
  addToCart(med: Medicine) {
    let cart: Medicine[] = JSON.parse(localStorage.getItem('medCart') || '[]');
    let exists: boolean = cart.some(m=>m.id == med.id);
    if(!exists){
      this.toast.success('successfully added to cart')
      cart.push(med);
      localStorage.setItem('medCart', JSON.stringify(cart));
    }
    else{
      this.toast.info('already exists in cart')
    }

  }
}
