export interface BookingResponse {
  serviceName: string;
  appointmentDate: string; // use string for API data
  price: number;
  duration: number;
  salonname: string;
  status: string;
}


export interface salonBookingResponse {
  appointmentID: number;
  serviceName: string;
  appointmentDate: string; // use string for API data
  price: number;
  duration: number;
  salonname: string;
  status: string;
}
