import { Calendar, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui_components/card"
import { useSalonApi } from "../../../../API/Salon_Owner_API/SalonOwnerAPI"
import { useEffect, useState } from "react";
import { Button } from "../../../../components/ui_components/button";
import type { salonBookingResponse } from "../../../../Interfaces/BookingInterface";

const DashBoardBusiness: React.FC = () => {

  const { apiSalonRequest } = useSalonApi();
  const [appointmentdata, setappointmentdata] = useState<salonBookingResponse[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [Selectbooking, setSelectbooking] = useState<salonBookingResponse | null>(null)


  useEffect(() => {
    fetchsalonAppointments();
  }, [])

  const fetchsalonAppointments = async () => {
    try {
      const res = await apiSalonRequest<salonBookingResponse[]>("/salon-appointments")
      if (res.error) {
        console.log("error =", res.error);
      }
      else {
        console.log(" data =", res.data);
        if (Array.isArray(res.data)) {
          setappointmentdata(res.data as salonBookingResponse[]);
        }
      }
    } catch (error) {
      console.log("error = ", error);

    }
  }

  function extractDateAndTime(isoString?: string) {
    if (!isoString) return "";
    const localDate = new Date(isoString);

    // Guard against invalid date
    if (isNaN(localDate.getTime())) return "";

    // Format it as a readable string
    const formatted = localDate.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    return formatted;
  }

  const handleconfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await apiSalonRequest(`/salon-appointment/verification?appointmentId=${Selectbooking?.appointmentID}`);
      if (res.error) {
        console.log("error =", res.error);
      }
      else {
        console.log(" data =", res.data);

      }
      setIsEditModalOpen(false);
      setSelectbooking(null)
    } catch (error) {
      console.log("error =", error);

    }

  }

  const handleRejectBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await apiSalonRequest(`/salon-appointment/rejected?appointmentId=${Selectbooking?.appointmentID}`);
      if (res.error) {
        console.log("error =", res.error);
      }
      else {
        console.log(" data =", res.data);

      }
      setIsEditModalOpen(false);
      setSelectbooking(null);
    } catch (error) {
      console.log("error =", error);

    }
  }
  return (
    <div className='w-auto'>
      <CardContent>
        <div className="space-y-4">
          {appointmentdata?.length > 0 && appointmentdata?.map((booking, index) => (
            <div
              key={index}
              className={`${booking?.status === "pending" ? "bg-yellow-200" : ""}flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors`}
              onClick={() => {
                setSelectbooking(booking);
                setIsEditModalOpen(true);
              }}
            >
              <div className="flex-1">
                <h4 className="font-medium text-lg">{booking.salonname}</h4>
                <h4 className="font-medium ">{booking.serviceName}</h4>
                {/* <p className="text-sm text-muted-foreground">with {booking.artist}</p> */}
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {extractDateAndTime(booking?.appointmentDate)}
                  </span>

                </div>
              </div>
              <div className="text-right">

                {booking?.status}

                <p className="text-lg font-semibold">{booking.price}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>







      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle>Approve Appointment</CardTitle>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>

              <div>

                <div
                  className={`${Selectbooking?.status === "pending" ? "bg-yellow-200" : ""}flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors`}
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-lg">{Selectbooking?.salonname}</h4>
                    <h4 className="font-medium ">{Selectbooking?.serviceName}</h4>
                    {/* <p className="text-sm text-muted-foreground">with {booking.artist}</p> */}
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {extractDateAndTime(Selectbooking?.appointmentDate)}
                      </span>

                    </div>
                  </div>
                  <div className="text-right">

                    {Selectbooking?.status}

                    <p className="text-lg font-semibold">{Selectbooking?.price}</p>
                  </div>
                </div>




                <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRejectBooking}
                    className="flex-1 bg-transparent"
                  >
                    Reject
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    onClick={handleconfirmBooking}
                  >
                    Approved
                  </Button>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>
      )}






    </div>
  )
}

export default DashBoardBusiness
