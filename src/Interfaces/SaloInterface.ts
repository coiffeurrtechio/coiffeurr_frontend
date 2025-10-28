export interface SalonService {
  serviceName: string;
  [key: string]: any; // fallback for extra properties
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
  salonStaffDTOS: [];
  description?: string;
  distance?: string;
}
