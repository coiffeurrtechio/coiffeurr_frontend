
import { useForm, Controller } from "react-hook-form"
import { useState } from "react"
import { Button } from "../../components/ui_components/button"
import { Input } from "../../components/ui_components/input"
import { Label } from "../../components/ui_components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui_components/select"
import { Card } from "../../components/ui_components/card"
import { useSelector } from "react-redux";
import { useApi } from "../../API/SalonsAPIs/ALLSalonAPI"
import { useNavigate } from "react-router-dom"
import { useToast } from "../../components/Toast"
import type { ReactFormState } from "react-dom/client"



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
  salonimages?:[]
}

export default function SalonRegistrationForm() {
  const userDetails = useSelector((state: any) => state.auth.user);
  const { apiPost} = useApi();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinCode, setPinCode] = useState("");
  
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
      salonimages:[]
    },
    mode: "onChange",
  })

  const SALON_TYPES = ["unisex", "male only", "female only"];
  const navigate = useNavigate();

 

  // function toggleService(value: string) {
  //   const current = form.getValues("salonServices")
  //   if (current.includes(value)) {
  //     form.setValue(
  //       "salonServices",
  //       current.filter((s) => s !== value),
  //       { shouldValidate: true, shouldDirty: true },
  //     )
  //   } else {
  //     form.setValue("salonServices", [...current, value], { shouldValidate: true, shouldDirty: true })
  //   }
  // }

  async function handleUseLocation() {
    // Check if HTTPS is required (most mobile browsers require HTTPS for geolocation)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      showToast({ 
        type: "error", 
        title: "HTTPS Required", 
        message: "Geolocation requires HTTPS. Please use a secure connection." 
      })
      return
    }

    if (!("geolocation" in navigator)) {
      setShowPinModal(true);
      return
    }

    // Detect if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        form.setValue("latitude", String(latitude), { shouldValidate: true, shouldDirty: true })
        form.setValue("longitude", String(longitude), { shouldValidate: true, shouldDirty: true })
        showToast({ type: "success", title: "Location captured", message: "Latitude and longitude have been filled." })
      },
      (err) => {
        // Show PIN code fallback on any geolocation error
        setShowPinModal(true);
      },
      { 
        enableHighAccuracy: isMobile, // Use high accuracy for mobile GPS
        timeout: isMobile ? 30000 : 10000, // Longer timeout for mobile (30s vs 10s)
        maximumAge: isMobile ? 60000 : 0 // Allow cached location on mobile (1 min)
      },
    )
  }

  async function handlePinCodeLocation() {
    if (!pinCode || pinCode.length < 6) {
      showToast({ type: "error", title: "Invalid PIN", message: "Please enter a valid 6-digit PIN code." })
      return
    }

    try {
      // Using a free geocoding API (you can replace with your preferred API)
      const response = await fetch(`https://api.postalpincode.in/pincode/${pinCode}`);
      const data = await response.json();
      
      if (data && data[0] && data[0].PostOffice && data[0].PostOffice[0]) {
        const location = data[0].PostOffice[0];
        const lat = parseFloat(location.Latitude);
        const lng = parseFloat(location.Longitude);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          form.setValue("latitude", String(lat), { shouldValidate: true, shouldDirty: true })
          form.setValue("longitude", String(lng), { shouldValidate: true, shouldDirty: true })
          form.setValue("city", location.District || "", { shouldValidate: true, shouldDirty: true })
          form.setValue("state", location.State || "", { shouldValidate: true, shouldDirty: true })
          setShowPinModal(false);
          setPinCode("");
          showToast({ type: "success", title: "Location found", message: `Location set to ${location.Name}, ${location.District}` })
        } else {
          showToast({ type: "error", title: "Location not found", message: "Could not find coordinates for this PIN code." })
        }
      } else {
        showToast({ type: "error", title: "Invalid PIN", message: "PIN code not found. Please check and try again." })
      }
    } catch (err) {
      showToast({ type: "error", title: "Error", message: "Failed to fetch location. Please try again." })
    }
  }

 async function onSubmit() {
  setIsSubmitting(true);
  try {
    const formData = { ...form.watch(), salonimages: imageUrls.filter(url => url.trim() !== "") };
    const res = await apiPost<[]>(
      "/salon/register",
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response =", res);

    if (res.error) {
      console.error("Error while registering:", res.error);
      showToast({ type: "error", title: "Registration Failed", message: res.error });
    } else {
      console.log("Salon registered successfully:", res.data);
      showToast({ type: "success", title: "Success", message: "Salon registered successfully!" });
      form.reset();
      setImageUrls([""]);
      navigate("/");
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    showToast({ type: "error", title: "Error", message: "An unexpected error occurred." });
  } finally {
    setIsSubmitting(false);
  }
}



  return (
    <div className="space-y-6">
      <Card className="p-4 md:p-6 lg:p-8 lg:px-12 bg-card text-card-foreground max-w-4xl mx-auto">
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
                {...form.register("salonName", { required: "Salon name is required" })}
              />
              {form.formState.errors.salonName && (
                <p className="text-red-500 text-sm">{form.formState.errors.salonName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name</Label>
              <Input
                id="ownerName"
                placeholder="e.g., Priya Sharma"
                {...form.register("ownerName", { required: "Owner name is required" })}
              />
              {form.formState.errors.ownerName && (
                <p className="text-red-500 text-sm">{form.formState.errors.ownerName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                
                {...form.register("email", { required: "Email is required" })}
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone"  placeholder="+91 98765 43210" {...form.register("phone", { required: "Phone number is required" })} />
              {form.formState.errors.phone && (
                <p className="text-red-500 text-sm">{form.formState.errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter a secure password" {...form.register("password", { required: "Password is required" })} />
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
              )}
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
              <Input id="openingTime" type="time" {...form.register("openingTime", { required: "Opening time is required" })} />
              {form.formState.errors.openingTime && (
                <p className="text-red-500 text-sm">{form.formState.errors.openingTime.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="closingTime">Closing Time</Label>
              <Input id="closingTime" type="time" {...form.register("closingTime", { required: "Closing time is required" })} />
              {form.formState.errors.closingTime && (
                <p className="text-red-500 text-sm">{form.formState.errors.closingTime.message}</p>
              )}
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
                {...form.register("street", { required: "Street address is required" })}
              />
              {form.formState.errors.street && (
                <p className="text-red-500 text-sm">{form.formState.errors.street.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="e.g., Mumbai" {...form.register("city", { required: "City is required" })} />
              {form.formState.errors.city && (
                <p className="text-red-500 text-sm">{form.formState.errors.city.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" placeholder="e.g., Maharashtra" {...form.register("state", { required: "State is required" })} />
              {form.formState.errors.state && (
                <p className="text-red-500 text-sm">{form.formState.errors.state.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" placeholder="e.g., 400001" {...form.register("pincode", { required: "Pincode is required" })} />
              {form.formState.errors.pincode && (
                <p className="text-red-500 text-sm">{form.formState.errors.pincode.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" placeholder="e.g., India" {...form.register("country", { required: "Country is required" })} />
              {form.formState.errors.country && (
                <p className="text-red-500 text-sm">{form.formState.errors.country.message}</p>
              )}
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
              <Controller
                name="salonType"
                control={form.control}
                rules={{ required: "Salon type is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
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
                )}
              />
              {form.formState.errors.salonType && (
                <p className="text-red-500 text-sm">{form.formState.errors.salonType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input id="logoUrl" placeholder="https://example.com/logo.png" {...form.register("logoUrl")} />
              {form.watch("logoUrl") && (
                <img src={form.watch("logoUrl")} alt="Salon Logo" className="w-16 h-16 md:w-20 md:h-20 object-cover rounded" />
              )}
            </div>
          </section>

          {/* Salon Images */}
          <section className="space-y-4">
            <Label>Salon Images (URLs)</Label>
            {imageUrls.map((url, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...imageUrls];
                      newUrls[index] = e.target.value;
                      setImageUrls(newUrls);
                    }}
                  />
                  {url && (
                    <img src={url} alt={`Salon Image ${index + 1}`} className="w-16 h-16 object-cover rounded" />
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const newUrls = imageUrls.filter((_, i) => i !== index);
                    setImageUrls(newUrls.length ? newUrls : [""]);
                  }}
                  disabled={imageUrls.length === 1}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => setImageUrls([...imageUrls, ""])}
            >
              Add Image
            </Button>
          </section>

          {/* Submit */}
          <div className="flex items-center justify-end">
            <Button type="submit" className="min-w-40" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit for Verification"}
            </Button>
          </div>
        </form>
      </Card>

      {/* PIN Code Fallback Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">💇‍♂️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Bad hair day for GPS!</h3>
              <p className="text-sm text-gray-600">Please provide your PIN code to the rescue!</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="pinCode">Enter PIN Code</Label>
                <Input
                  id="pinCode"
                  type="text"
                  placeholder="e.g., 400001"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPinModal(false);
                    setPinCode("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handlePinCodeLocation}
                  className="flex-1"
                >
                  Find Location
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

