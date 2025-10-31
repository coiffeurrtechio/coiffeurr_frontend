// export interface SalonService {
//   serviceName: string;
//   [key: string]: any; // fallback for extra properties
// }


export interface SalonService {
  serviceName: string;
  price?: number;
  description?: string;
  available?: boolean;
  serviceID?: number;
}
export interface Salon {
  id: number;
  salonName: string;
  email?: string;
  ownerName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: number;
  country: string;
  openingTime: string;
  closingTime: string;
  rating: number;
  reviews: number;
  latitude: string;
  longitude: string;
  salonType: string;
  logoUrl: string;
  image: string;
  description?: string;
  priceRange: string;
  salonServices?: SalonService[];
  salonStaffDTOS: salonStaffDTOS[];
}


export interface salonStaffDTOS {
  staffname: string,
  staffimage: string,
  staffexperience: number,
  description: number,
  staffphone: number,
}

export interface SalonInterface {
  id: string;
  salonName: string;
  ownerName: string;
  email?: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: number;
  country: string;
  openingTime: string;
  closingTime: string;
  lunchStart: string;
  lunchEnd: string;
  rating: number;
  reviews: number;
  latitude: string;
  longitude: string;
  salonType: string;
  logoUrl: string;
  image: string;
  priceRange: string;
  salonServices: SalonService[];
  salonStaffDTOS: salonStaffDTOS[];
  description?: string;
  distance?: string;
}


export interface salonServiceInterface {
  price: string,
  descriptions: string[],
  available: string,
  capacity: string,
  slotTime: string,
  serviceID: string,
  includedItems: string[],
}

export interface salonSataff {
  staffname: string,
  staffexperience: string,
  description: string,
  staffphone: string,
  staffimage: string,
}

export interface services {
  service_id: number,
  service_name: string,
}




export interface salonSlots {
  date: string,
  time: string,
  available: boolean,
  bookedCount: string,
}