
import * as React from "react"
import { useForm } from "react-hook-form"
import { Button } from "../../components/ui_components/button"
import { Input } from "../../components/ui_components/input"
import { Label } from "../../components/ui_components/label"
import { Textarea } from "../../components/ui_components/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui_components/select"
import { Card } from "../../components/ui_components/card"
import { useSelector } from "react-redux";
import { useApi } from "../../API/SalonsAPIs/ALLSalonAPI"
import { useNavigate } from "react-router-dom"



type FormValues = {
  salonName: string
  ownerName: string
  openingTime: string
  closingTime: string
  lunchStart: string
  lunchEnd: string
  email: string
  phone: string
  street: string
  city: string
  state: string
  pincode: string
  country: string
  latitude?: string
  longitude?: string
  salonType: string
  logoUrl?: string
  registrationNumber?: string
  gstNumber?: string
  salonServices: string[]
  password?: string
}

export default function SalonRegistrationForm() {
  const [servicesOpen, setServicesOpen] = React.useState(false)
  const [logoPreview, setLogoPreview] = React.useState<string | undefined>(undefined)
  const userDetails = useSelector((state: any) => state.auth.user);
  const {apiRequest, apiPost} = useApi();
  
  const form = useForm<FormValues>({
    defaultValues: {
      salonName: "",
      ownerName: "",
      openingTime: "19:00:00",
      closingTime: "19:00:00",
      lunchStart: "19:00:00",
      lunchEnd: "19:00:00",
      email: userDetails.email,
      phone: userDetails.phone,
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
      latitude: "",
      longitude: "",
      salonType: "",
      logoUrl: "",
      registrationNumber: "",
      gstNumber: "",
      salonServices: [],
    },
    mode: "onChange",
  })

  const selectedServices = form.watch("salonServices")
  const logoUrl = form.watch("logoUrl")
  const SALON_TYPES = ["unisex", "male only", "female only"];
  const navigate = useNavigate();

  React.useEffect(() => {
    if (logoUrl && logoUrl.startsWith("http")) {
      setLogoPreview(logoUrl)
    } else {
      setLogoPreview(undefined)
    }
  }, [logoUrl])

  function toggleService(value: string) {
    const current = form.getValues("salonServices")
    if (current.includes(value)) {
      form.setValue(
        "salonServices",
        current.filter((s) => s !== value),
        { shouldValidate: true, shouldDirty: true },
      )
    } else {
      form.setValue("salonServices", [...current, value], { shouldValidate: true, shouldDirty: true })
    }
  }

  async function handleUseLocation() {
    if (!("geolocation" in navigator)) {
      alert({ title: "Location not available", description: "Your browser does not support geolocation." })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        form.setValue("latitude", String(latitude), { shouldValidate: true, shouldDirty: true })
        form.setValue("longitude", String(longitude), { shouldValidate: true, shouldDirty: true })
        alert({ title: "Location captured", description: "Latitude and longitude have been filled." })
      },
      (err) => {
        alert({ title: "Unable to get location", description: err.message })
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

 async function onSubmit() {

  try {
    const res = await apiPost<[]>(
      "/salon/register",
      form.watch(), // or just use values
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response =", res);

    if (res.error) {
      console.error("Error while registering:", res.error);
    } else {
      console.log("Salon registered successfully:", res.data);
      
      form.reset(); // Uncomment if you want to clear the form
      navigate("/");
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}



  return (
    <div className="space-y-6">
      <Card className="p-4 md:p-6 md:px-20 bg-card text-card-foreground">
        <div className="mb-4">
          <div className="flex items-center justify-center flex-col">
            <h2 className="text-xl md:text-2xl font-semibold text-pretty">Register your Salon</h2>
            <p className="text-sm text-muted-foreground">
              Enter your salon details to get listed. We’ll verify the information before publishing.
            </p>
          </div>
          
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salonName">Salon Name</Label>
              <Input
                id="salonName"
                placeholder="e.g., Urban Cuts"
                {...form.register("salonName", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name</Label>
              <Input
                id="ownerName"
                placeholder="e.g., Priya Sharma"
                {...form.register("ownerName", { required: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                
                {...form.register("email", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone"  placeholder="+91 98765 43210" {...form.register("phone", { required: true })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                placeholder="Govt. registration number"
                {...form.register("registrationNumber")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gstNumber">GST Number</Label>
              <Input id="gstNumber" placeholder="e.g., 22AAAAA0000A1Z5" {...form.register("gstNumber")} />
            </div>
          </section>

          {/* Times */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openingTime">Opening Time</Label>
              <Input id="openingTime" type="time" {...form.register("openingTime", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closingTime">Closing Time</Label>
              <Input id="closingTime" type="time" {...form.register("closingTime", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lunchStart">Lunch Start</Label>
              <Input id="lunchStart" type="time" {...form.register("lunchStart")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lunchEnd">Lunch End</Label>
              <Input id="lunchEnd" type="time" {...form.register("lunchEnd")} />
            </div>
          </section>

          {/* Address */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="street">Street</Label>
              <Input
                id="street"
                placeholder="House/Flat, Street, Area"
                {...form.register("street", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="e.g., Mumbai" {...form.register("city", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" placeholder="e.g., Maharashtra" {...form.register("state", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" placeholder="e.g., 400001" {...form.register("pincode", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" placeholder="e.g., India" {...form.register("country", { required: true })} />
            </div>
          </section>

          {/* Location */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input id="latitude" placeholder="e.g., 19.0760" {...form.register("latitude")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input id="longitude" placeholder="e.g., 72.8777" {...form.register("longitude")} />
            </div>
            <div className="flex items-end">
              <Button type="button" className="w-full" onClick={handleUseLocation}>
                Use my location
              </Button>
            </div>
          </section>

          {/* Salon Type */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Salon Type</Label>
              <Select
                onValueChange={(v) => form.setValue("salonType", v, { shouldValidate: true, shouldDirty: true })}
                value={form.watch("salonType")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select salon type" />
                </SelectTrigger>
                <SelectContent>
                  {SALON_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input id="logoUrl" placeholder="https://example.com/logo.png" {...form.register("logoUrl")} />
              <img src={form.getValues("logoUrl")} alt="" />
            </div>
          </section>

          

         

          {/* Submit */}
          <div className="flex items-center justify-end">
            <Button type="submit" className="min-w-40">
              Submit for Verification
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

