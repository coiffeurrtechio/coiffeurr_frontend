import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui_components/card"
import { Mail, Phone, MapPin, Calendar, MapPinHouse, User, Plus, X } from "lucide-react"
import { Button } from "../../../../components/ui_components/button"
import { useEffect, useState } from "react"
import type { SalonInterface, salonSataff, SalonService, salonServiceInterface, services } from "../../../../Interfaces/SaloInterface"
import { Input } from "../../../../components/ui_components/input"
import { useSalonApi } from "../../../../API/Salon_Owner_API/SalonOwnerAPI"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui_components/select"

export default function DashBoardProfile() {
    const profileData = {
        name: "John Anderson",
        role: "Salon Manager",
        email: "john@luxebeauty.com",
        phone: "+1 (555) 123-4567",
        location: "New York, NY",
        joinDate: "January 2015",
        bio: "Experienced salon manager with 10+ years in the beauty industry.",
    }

    const [salonData, setsalonData] = useState<SalonInterface | undefined>();
    const { apiSalonRequest, apiSalonPost, apiSalonPut } = useSalonApi();
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isEditModalServiceOpen, setisEditModalServiceOpen] = useState(false)
    const [editFormData, setEditFormData] = useState<SalonInterface | undefined>(salonData)
    const [salonDetails, setSalonDetails] = useState<SalonInterface | undefined>(editFormData)
    const [formData, setFormData] = useState<salonSataff>({
        staffname: "",
        staffexperience: "",
        description: "",
        staffphone: "",
        staffimage: "",
    })
    const [NewSalonService, setNewSalonService] = useState({
        price: "",
        descriptions: [""],
        available: "",
        capacity: "",
        slotTime: "",
        serviceID: "",
        includedItems: [""],
        heading: "",
        serviceImages: [""],   // images inside saloninfoDTO
        imageUrls: [""],       // main service images (if any)
    });


    const [ALLService, setALLService] = useState<services[]>([]);

    useEffect(() => {
        fetchSalonDetails();
    }, []);

    const fetchSalonDetails = async () => {

        try {
            const res = await apiSalonRequest<SalonInterface>("/details");

            console.log("res =", res);

            if (res.error) {
                console.error("API Error:", res.error);
                // setError("Failed to fetch salons");
            } else if (res.data) {
                setsalonData(res.data);
            }
        } catch (err) {
            console.error("Unexpected error fetching salons:", err);
            //   setError("Something went wrong while fetching salons");
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault()
        try {
            const res = await apiSalonPost("/salonStaff", formData);

            if (res.error) {
                console.error("Error while registering:", res.error);
            } else {
                console.log("Salon registered successfully:", res.data);
                setIsModalOpen(false);
            }
        } catch (error) {

            console.error("Unexpected error:", error);

        }



    }


    const handleSubmitService = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                available: Boolean(NewSalonService.available),
                capacity: NewSalonService.capacity,
                price: Number(NewSalonService.price),
                serviceID: Number(NewSalonService.serviceID),
                slotTime: Number(NewSalonService.slotTime),
                imageUrls: NewSalonService.imageUrls,

                saloninfoDTO: {
                    heading: NewSalonService.heading,
                    description: NewSalonService.descriptions.filter(d => d.trim() !== ""),
                    included_items: NewSalonService.includedItems.filter(i => i.trim() !== ""),
                    images: NewSalonService.serviceImages,
                },
            };
            const res = await apiSalonPost("/salonService", payload);

            if (res.error) {
                console.error("Error while registering:", res.error);
            } else {
                console.log("Salon registered successfully:", res.data);
                setisEditModalServiceOpen(false);
            }
        } catch (error) {

            console.error("Unexpected error:", error);

        }



    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log("data for update =", editFormData);

        // Compute only changed data
        const changedData: Partial<SalonInterface> = { id: editFormData?.id }; // Always include id

        if (editFormData && salonData) {
            Object.keys(editFormData).forEach(key => {
                const editValue = (editFormData as any)[key];
                const originalValue = (salonData as any)[key];

                // Special handling for arrays
                if (Array.isArray(editValue) && Array.isArray(originalValue)) {
                    if (JSON.stringify(editValue) !== JSON.stringify(originalValue)) {
                        changedData[key as keyof SalonInterface] = editValue;
                    }
                } else if (editValue !== originalValue) {
                    changedData[key as keyof SalonInterface] = editValue;
                }
            });
        }

        console.log("changed data =", changedData);

        try {
            const res = await apiSalonPut<string>("/update-salon", changedData)
            if (res.error) {
                console.error("Error while registering:", res.error);
            } else {
                console.log("Salon registered successfully:", res.data);
                setsalonData(editFormData);
                setIsEditModalOpen(false)
            }

        } catch (error) {
            console.error("Unexpected error:", error);
        }
    }

    const handleEditClick = () => {
        setEditFormData(salonData)
        setIsEditModalOpen(true)
    }

    const handleEditInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        setEditFormData((prev) => {
            if (!prev) return prev; // safely handle undefined
            return { ...prev, [name]: value };
        });
    };

    const handleImageUrlChange = (index: number, value: string) => {
        setEditFormData((prev) => {
            if (!prev) return prev;
            const newImages = [...(prev.salonimages || [])];
            newImages[index] = value;
            return { ...prev, salonimages: newImages };
        });
    };

    const removeImage = (index: number) => {
        setEditFormData((prev) => {
            if (!prev) return prev;
            const newImages = (prev.salonimages || []).filter((_, i) => i !== index);
            return { ...prev, salonimages: newImages };
        });
    };

    const addImage = () => {
        setEditFormData((prev) => {
            if (!prev) return prev;
            const newImages = [...(prev.salonimages || []), ''];
            return { ...prev, salonimages: newImages };
        });
    };




    const handleSalonServiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        console.log("name =", name);
        console.log("value =", value);

        setNewSalonService((prev: salonServiceInterface) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleArrayItemChange = (
        field: keyof salonServiceInterface,
        index: number,
        value: string | number
    ) => {
        setNewSalonService((prev: salonServiceInterface) => {
            const updatedArray = [...(prev[field] as (string | number)[])];
            updatedArray[index] = value;
            return { ...prev, [field]: updatedArray };
        });
    };



    const addArrayItemField = (field: keyof salonServiceInterface) => {
        setNewSalonService((prev: salonServiceInterface) => {
            const currentArray = prev[field] as any[];

            // Add a new empty object or appropriate default item
            const newItem = {}; // or { serviceName: '', price: 0 } etc.

            return { ...prev, [field]: [...currentArray, newItem] };
        });
    };


    const removeArrayItemField = (
        field: keyof salonServiceInterface,
        index: number
    ) => {
        setNewSalonService((prev: salonServiceInterface) => {
            // Ensure prev[field] is treated as an array
            const currentArray = prev[field] as unknown as any[];
            const updatedArray = currentArray.filter((_: any, i: number) => i !== index);

            return { ...prev, [field]: updatedArray };
        });
    };






    const handleServiceSelect = (value: any, name: string) => {
        setNewSalonService((prev) => ({
            ...prev,
            [name]: value,
        }));
    };




    const fetchServices = async () => {
        try {
            const res = await apiSalonRequest<services[]>("/Services")

            if (res.error) {
                console.error("API Error:", res.error);
                // setError("Failed to fetch salons");
            } else if (res.data) {
                setALLService(res.data);
            }

        } catch (error) {
            console.error("Unexpected error fetching salons:", error);

        }
    }

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            <div>
                <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">{salonData?.salonName}</h1>
                <p className="text-muted-foreground">{salonData?.salonType}</p>
            </div>

            {/* Profile Card */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
                            <div className="w-16 h-16 md:w-24 md:h-24 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl md:text-4xl font-bold text-primary-foreground">JA</span>
                            </div>
                            <div className="text-center sm:text-left">
                                <CardTitle className="text-xl md:text-2xl">{salonData?.ownerName}</CardTitle>
                                <p className="text-primary mt-1">Owner</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleEditClick}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">Edit Profile</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-foreground">{profileData.bio}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-4">
                            <Mail className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Email</p>
                                <p className="text-foreground">{salonData?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Phone className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                <p className="text-foreground">{salonData?.phone}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Openning Time</p>
                                <p className="text-foreground">{salonData?.openingTime}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Calendar className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Closing Time</p>
                                <p className="text-foreground">{salonData?.closingTime}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Lunch Time Start</p>
                                <p className="text-foreground">{salonData?.lunchStart}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Calendar className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Lunch Time end</p>
                                <p className="text-foreground">{salonData?.lunchEnd}</p>
                            </div>
                        </div>
                        <div>
                        </div>
                    </div>
                </CardContent>
            </Card>


            {/* Address */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                            <MapPinHouse className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                            <p className="text-foreground text-lg font-bold">Address</p>
                        </div>

                    </div>
                </CardHeader>
                <CardContent className="space-y-6">

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="flex items-start gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Country</p>
                                <p className="text-foreground">{salonData?.country}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">City</p>
                                <p className="text-foreground">{salonData?.city}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">state</p>
                                <p className="text-foreground">{salonData?.state}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">pincode</p>
                                <p className="text-foreground">{salonData?.pincode}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">street</p>
                                <p className="text-foreground">{salonData?.street}</p>
                            </div>
                        </div>
                        <div>
                        </div>
                    </div>
                </CardContent>
            </Card>



            {/* Salon Staff */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">


                        <div className="flex gap-4">
                            <User className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                            <p className="text-foreground text-lg font-bold">Salon Staff</p>
                        </div>
                        <div
                            onClick={() => setIsModalOpen(true)}
                            className="flex gap-4 hover:bg-gray-200 p-2 cursor-pointer rounded-2xl duration-500 w-full md:w-auto justify-center md:justify-start"
                        >
                            <Plus className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                            <p className="text-foreground text-lg ">Add New Staff Member</p>
                        </div>

                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">

                    {salonData?.salonStaffDTOS && salonData?.salonStaffDTOS.map((item, index) => (

                        <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-secondary/50 rounded-lg gap-4">
                            <div>
                                <p className="font-medium text-foreground">{item?.staffname}</p>
                                <p className="text-sm text-muted-foreground">{item?.staffexperience}</p>
                                <p className="text-sm text-muted-foreground">{item?.description}</p>
                            </div>
                            <div className="text-left sm:text-right">
                                <p>{item?.staffphone}</p>
                            </div>
                        </div>
                    ))}

                </CardContent>
            </Card>


            {/* Salon Services  */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">


                        <div className="flex gap-4">
                            <User className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                            <p className="text-foreground text-lg font-bold">Salon Services</p>
                        </div>
                        <div
                            onClick={() => {
                                fetchServices();
                                setisEditModalServiceOpen(true)
                            }}
                            className="flex gap-4 hover:bg-gray-200 p-2 cursor-pointer rounded-2xl duration-500 w-full md:w-auto justify-center md:justify-start"
                        >
                            <Plus className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                            <p className="text-foreground text-lg ">Add New Salon Service</p>
                        </div>

                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">

                    {salonData?.salonServices && salonData?.salonServices.map((item: SalonService, index: number) => (

                        <div
                            key={index}
                            className={`${item?.available === true ? "bg-red-200" : "bg-secondary/50"
                                } flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg gap-4`}
                        >
                            <div>
                                <p className="font-medium text-foreground">{item.serviceName}</p>
                                <p className="text-sm text-muted-foreground">{item.price}</p>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                        </div>
                    ))}

                </CardContent>
            </Card>


            {/* Modal to add staff  */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <CardTitle>Add Staff Member</CardTitle>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-2">Staff Name</label>
                                    <Input
                                        type="text"
                                        name="staffname"
                                        value={formData?.staffname}
                                        onChange={handleInputChange}
                                        placeholder="Enter staff name"
                                        required
                                        className="bg-background border-border"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-2">Staff Image (Initials)</label>
                                    <Input
                                        type="text"
                                        name="staffimage"
                                        value={formData.staffimage}
                                        onChange={handleInputChange}
                                        placeholder="e.g., SJ"
                                        // maxLength={2}
                                        className="bg-background border-border"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-2">Experience</label>
                                    <Input
                                        type="text"
                                        name="staffexperience"
                                        value={formData.staffexperience}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 5 years"
                                        className="bg-background border-border"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Enter staff description"
                                        rows={3}
                                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-2">Staff Phone</label>
                                    <Input
                                        type="tel"
                                        name="staffphone"
                                        value={formData.staffphone}
                                        onChange={handleInputChange}
                                        placeholder="Enter phone number"
                                        required
                                        className="bg-background border-border"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 bg-transparent"
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1">
                                        Submit
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}


            {/* Modal to add Salon Services  */}
            {isEditModalServiceOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-3xl bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <CardTitle>Add Salon Service</CardTitle>
                            <button onClick={() => setisEditModalServiceOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </CardHeader>
                        <CardContent className="max-h-[80vh] overflow-y-auto pr-2">
                            {/* <form onSubmit={handleSubmitService} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">  */}

                            <form
                                onSubmit={handleSubmitService}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {/* SERVICE */}
                                <div>
                                    <label className="text-sm font-medium block mb-2">Service</label>
                                    <Select
                                        value={NewSalonService.serviceID}
                                        onValueChange={(v) => handleServiceSelect(v, "serviceID")}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Service" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ALLService.map((item) => (
                                                <SelectItem
                                                    key={item.service_id}
                                                    value={String(item.service_id)}
                                                >
                                                    {item.service_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* PRICE */}
                                <div>
                                    <label className="text-sm font-medium block mb-2">Price</label>
                                    <Input
                                        name="price"
                                        value={NewSalonService.price}
                                        onChange={handleSalonServiceChange}
                                        placeholder="300"
                                    />
                                </div>

                                {/* CAPACITY */}
                                <div>
                                    <label className="text-sm font-medium block mb-2">Capacity</label>
                                    <Input
                                        name="capacity"
                                        value={NewSalonService.capacity}
                                        onChange={handleSalonServiceChange}
                                        placeholder="4"
                                    />
                                </div>

                                {/* SLOT TIME */}
                                <div>
                                    <label className="text-sm font-medium block mb-2">
                                        Slot Time (minutes)
                                    </label>
                                    <Input
                                        name="slotTime"
                                        value={NewSalonService.slotTime}
                                        onChange={handleSalonServiceChange}
                                        placeholder="30"
                                    />
                                </div>

                                {/* AVAILABLE */}
                                <div>
                                    <label className="text-sm font-medium block mb-2">Available</label>
                                    <Select
                                        onValueChange={(value) => handleServiceSelect(value === "true", "available")}
                                        value={NewSalonService.available} // store as string

                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Yes / No" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Yes</SelectItem>
                                            <SelectItem value="false">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* HEADING */}
                                <div className="col-span-full">
                                    <label className="text-sm font-medium block mb-2">
                                        Service Heading
                                    </label>
                                    <Input
                                        name="heading"
                                        value={NewSalonService.heading}
                                        onChange={handleSalonServiceChange}
                                        placeholder="Bridal Makeup Pack"
                                    />
                                </div>

                                {/* DESCRIPTIONS */}
                                <div className="col-span-full">
                                    <label className="text-sm font-medium block mb-2">
                                        Service Descriptions
                                    </label>
                                    {NewSalonService.descriptions.map((desc, index) => (
                                        <div key={index} className="flex gap-2 mb-2">
                                            <Input
                                                value={desc}
                                                onChange={(e) =>
                                                    handleArrayItemChange("descriptions", index, e.target.value)
                                                }
                                                placeholder={`Description ${index + 1}`}
                                            />
                                            {NewSalonService.descriptions.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeArrayItemField("descriptions", index)
                                                    }
                                                    className="text-red-500"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => addArrayItemField("descriptions")}
                                        className="w-full border-dashed"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Description
                                    </Button>
                                </div>
                                
                                <div className="col-span-full">
                                    <label className="text-sm font-medium block mb-2">
                                        Service images
                                    </label>
                                    {NewSalonService.serviceImages.map((desc, index) => (
                                        <div key={index} className="flex gap-2 mb-2">
                                            <Input
                                                value={desc}
                                                onChange={(e) =>
                                                    handleArrayItemChange("serviceImages", index, e.target.value)
                                                }
                                                placeholder={`Description ${index + 1}`}
                                            />
                                            {NewSalonService.serviceImages.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeArrayItemField("serviceImages", index)
                                                    }
                                                    className="text-red-500"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => addArrayItemField("serviceImages")}
                                        className="w-full border-dashed"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add image
                                    </Button>
                                </div>

                                {/* INCLUDED ITEMS */}
                                <div className="col-span-full">
                                    <label className="text-sm font-medium block mb-2">
                                        Included Items
                                    </label>
                                    {NewSalonService.includedItems.map((item, index) => (
                                        <div key={index} className="flex gap-2 mb-2">
                                            <Input
                                                value={item}
                                                onChange={(e) =>
                                                    handleArrayItemChange("includedItems", index, e.target.value)
                                                }
                                                placeholder={`Item ${index + 1}`}
                                            />
                                            {NewSalonService.includedItems.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeArrayItemField("includedItems", index)
                                                    }
                                                    className="text-red-500"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => addArrayItemField("includedItems")}
                                        className="w-full border-dashed"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Included Item
                                    </Button>
                                </div>

                                {/* ACTIONS */}
                                <div className="col-span-full flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setisEditModalServiceOpen(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1">
                                        Submit
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}


            {/* Modal to update salon details  */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-3xl bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <CardTitle>Edit Salon Profile</CardTitle>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </CardHeader>
                        <CardContent className="max-h-[80vh] overflow-y-auto pr-2">
                            <form
                                onSubmit={handleEditSubmit}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 "
                            >
                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-2">
                                        Salon Name
                                    </label>
                                    <Input
                                        type="text"
                                        name="salonName"
                                        value={editFormData?.salonName}
                                        onChange={handleEditInputChange}
                                        placeholder="Enter salon name"
                                        required
                                        className="bg-background border-border"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-2">
                                        Country
                                    </label>
                                    <Input
                                        type="text"
                                        name="country"
                                        value={editFormData?.country}
                                        onChange={handleEditInputChange}
                                        placeholder="Enter salon address"
                                        required
                                        className="bg-background border-border"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-2">
                                        State
                                    </label>
                                    <Input
                                        type="text"
                                        name="state"
                                        value={editFormData?.state}
                                        onChange={handleEditInputChange}
                                        placeholder="Enter salon address"
                                        required
                                        className="bg-background border-border"
                                    />
                                </div>


                                {/* <div>
                                    <label className="text-sm font-medium text-foreground block mb-2">
                                        Phone
                                    </label>
                                    <Input
                                        type="tel"
                                        name="phone"
                                        value={editFormData?.phone}
                                        onChange={handleEditInputChange}
                                        placeholder="Enter phone number"
                                        required
                                        className="bg-background border-border"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-2">
                                        Email
                                    </label>
                                    <Input
                                        type="email"
                                        name="email"
                                        value={editFormData?.email}
                                        onChange={handleEditInputChange}
                                        placeholder="Enter email address"
                                        required
                                        className="bg-background border-border"
                                    />
                                </div> */}

                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-2">
                                        Opening Timing
                                    </label>
                                    <Input
                                        type="time"
                                        name="openingTime"
                                        value={editFormData?.openingTime}
                                        onChange={handleEditInputChange}
                                        placeholder="e.g., Mon-Fri: 9AM-7PM"
                                        required
                                        className="bg-background border-border"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-2">
                                        Closing Timing
                                    </label>
                                    <Input
                                        type="time"
                                        name="closingTime"
                                        value={editFormData?.closingTime}
                                        onChange={handleEditInputChange}
                                        placeholder="e.g., Mon-Fri: 9AM-7PM"
                                        required
                                        className="bg-background border-border"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-2">
                                        Lunch Time Start
                                    </label>
                                    <Input
                                        type="time"
                                        name="lunchStart"
                                        value={editFormData?.lunchStart}
                                        onChange={handleEditInputChange}
                                        placeholder="e.g., Mon-Fri: 9AM-7PM"
                                        required
                                        className="bg-background border-border"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-2">
                                        Lunch Time End
                                    </label>
                                    <Input
                                        type="time"
                                        name="lunchEnd"
                                        value={editFormData?.lunchEnd}
                                        onChange={handleEditInputChange}
                                        placeholder="e.g., Mon-Fri: 9AM-7PM"
                                        required
                                        className="bg-background border-border"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-2">
                                        Street
                                    </label>
                                    <Input
                                        type="text"
                                        name="street"
                                        value={editFormData?.street}
                                        onChange={handleEditInputChange}
                                        placeholder="Enter salon address"
                                        required
                                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                

                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-2">
                                        Registration Number
                                    </label>
                                    <Input
                                        type="text"
                                        name="registrationNumber"
                                        value={editFormData?.registrationNumber || ''}
                                        onChange={handleEditInputChange}
                                        placeholder="Enter registration number"
                                        className="bg-background border-border"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-2">
                                        GST Number
                                    </label>
                                    <Input
                                        type="text"
                                        name="gstNumber"
                                        value={editFormData?.gstNumber || ''}
                                        onChange={handleEditInputChange}
                                        placeholder="Enter GST number"
                                        className="bg-background border-border"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-2">
                                        Opening Hours JSON
                                    </label>
                                    <Input
                                        type="text"
                                        name="openingHoursJson"
                                        value={editFormData?.openingHoursJson || ''}
                                        onChange={handleEditInputChange}
                                        placeholder="Enter opening hours JSON"
                                        className="bg-background border-border"
                                    />
                                </div>

                                

                                <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                                    <label className="text-sm font-medium text-foreground block mb-2">
                                        Salon Images
                                    </label>
                                    <div className="space-y-2">
                                        {editFormData?.images?.map((url, index) => (
                                            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                                <img src={url} alt={`Salon image ${index + 1}`} className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0" />
                                                <Input
                                                    type="url"
                                                    value={url}
                                                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                                                    placeholder="Enter image URL"
                                                    className="flex-1 bg-background border-border"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => removeImage(index)}
                                                    className="text-red-500 w-full sm:w-auto"
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={addImage}
                                            className="w-full"
                                        >
                                            Add Image
                                        </Button>
                                    </div>
                                </div>

                                <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="flex-1 bg-transparent"
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1">
                                        Update
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

        </div>
    )
}
