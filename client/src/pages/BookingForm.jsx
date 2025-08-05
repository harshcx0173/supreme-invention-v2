import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import {
  Calendar,
  Clock,
  User,
  FileText,
  Users,
  MapPin,
  Video,
  Mail,
  Plus,
  X,
  Globe,
  Building
} from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

const BookingForm = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    meetingType: "online",
    attendees: [],
    meetingPlatform: "",
    location: {
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: ""
    }
  });

  const [platforms, setPlatforms] = useState([]);
  const [newAttendee, setNewAttendee] = useState({ email: "", name: "" });
  const [addressInput, setAddressInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetchAvailableSlots();
    fetchPlatforms();
  }, [selectedDate]);

  const fetchPlatforms = async () => {
    try {
      const response = await axios.get("/api/bookings/platforms");
      setPlatforms(response.data);
    } catch (error) {
      console.error("Error fetching platforms:", error);
    }
  };

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const response = await axios.get("/api/calendar/available-slots", {
        params: {
          date: selectedDate.toISOString().split("T")[0],
          duration: 30,
        },
      });
      setAvailableSlots(response.data.availableSlots);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      toast.error("Failed to fetch available time slots");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;

    // If it's the main address field, try to parse it
    if (name === "address" && value.includes(",")) {
      const addressParts = value.split(",").map(part => part.trim());

      // Try to parse the address into components
      if (addressParts.length >= 3) {
        const newLocation = {
          address: addressParts[0] || "",
          city: addressParts[1] || "",
          state: addressParts[2] || "",
          postalCode: addressParts[3] || "",
          country: addressParts[4] || "India"
        };

        setFormData((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            ...newLocation,
            [name]: value, // Keep the original input
          },
        }));
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value,
      },
    }));
  };

  const handleAttendeeChange = (e) => {
    const { name, value } = e.target;
    setNewAttendee((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addAttendee = () => {
    if (!newAttendee.email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAttendee.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const isDuplicate = formData.attendees.some(
      (attendee) => attendee.email === newAttendee.email
    );

    if (isDuplicate) {
      toast.error("This email is already added");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      attendees: [...prev.attendees, { ...newAttendee }],
    }));

    setNewAttendee({ email: "", name: "" });
  };

  const removeAttendee = (index) => {
    setFormData((prev) => ({
      ...prev,
      attendees: prev.attendees.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Please enter a meeting title");
      return;
    }

    if (formData.meetingType === "online" && !formData.meetingPlatform) {
      toast.error("Please select a meeting platform");
      return;
    }

    if (formData.meetingType === "offline" && !formData.location.address.trim()) {
      toast.error("Please enter a meeting location");
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        title: formData.title,
        description: formData.description,
        meetingType: formData.meetingType,
        attendees: formData.attendees,
        meetingPlatform: formData.meetingPlatform,
        location: formData.meetingType === "offline" ? formData.location : undefined,
      };

      const response = await axios.post("/api/bookings", bookingData);

      toast.success("Booking created successfully!");
      navigate("/my-bookings");
    } catch (error) {
      console.error("Error creating booking:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to create booking";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // midnight
    return date < today;
  };

  // Handler for address input change
  const handleAddressInputChange = async (e) => {
    const value = e.target.value;
    setAddressInput(value);
    setShowSuggestions(true);
    if (value.length > 2) {
      try {
        const res = await axios.get("/api/maps/autosuggest", { params: { query: value } });
        setSuggestions(res.data);
      } catch (err) {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  // Handler for suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setAddressInput(suggestion.address.freeformAddress);
    setShowSuggestions(false);
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        address: suggestion.address.streetName || suggestion.address.freeformAddress || "",
        city: suggestion.address.municipality || "",
        state: suggestion.address.countrySubdivision || "",
        postalCode: suggestion.address.postalCode || "",
        country: suggestion.address.country || ""
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Book a Meeting
          </h1>
          <p className="text-gray-600">
            Select a date and time slot to schedule your meeting
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Select Date
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              // filterDate={isDateDisabled}
              minDate={new Date()}
              dateFormat="MMMM d, yyyy"
              className="input"
              placeholderText="Select a date"
            />
          </div>

          {/* Time Slots */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline h-4 w-4 mr-1" />
              Available Time Slots
            </label>

            {loadingSlots ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-2 text-gray-600">
                  Loading available slots...
                </span>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No available slots for this date</p>
                <p className="text-sm">Try selecting a different date</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSlotSelect(slot)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${selectedSlot === slot
                        ? "border-primary-600 bg-primary-50 text-primary-700"
                        : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                      }`}
                  >
                    {slot.formatted}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Meeting Details */}
          {selectedSlot && (
            <div className="space-y-6">
              {/* Meeting Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Meeting Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Enter meeting title"
                  required
                />
              </div>

              {/* Meeting Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="inline h-4 w-4 mr-1" />
                  Meeting Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, meetingType: "online" }))}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${formData.meetingType === "online"
                        ? "border-primary-600 bg-primary-50 text-primary-700"
                        : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                      }`}
                  >
                    <Video className="inline h-4 w-4 mr-2" />
                    Online Meeting
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, meetingType: "offline" }))}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${formData.meetingType === "offline"
                        ? "border-primary-600 bg-primary-50 text-primary-700"
                        : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                      }`}
                  >
                    <Building className="inline h-4 w-4 mr-2" />
                    In-Person Meeting
                  </button>
                </div>
              </div>

              {/* Online Meeting Platform */}
              {formData.meetingType === "online" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Video className="inline h-4 w-4 mr-1" />
                    Meeting Platform *
                  </label>
                  <select
                    name="meetingPlatform"
                    value={formData.meetingPlatform}
                    onChange={handleInputChange}
                    className="input"
                    required
                  >
                    <option value="">Select a platform</option>
                    {platforms.map((platform) => (
                      <option key={platform.value} value={platform.value}>
                        {platform.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Offline Meeting Location */}
              {formData.meetingType === "offline" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      Meeting Location *
                    </label>

                    {/* Dynamic Address Input */}
                    <div className="space-y-3" style={{ position: "relative" }}>
                      <input
                        type="text"
                        name="address"
                        value={addressInput}
                        onChange={handleAddressInputChange}
                        className="input"
                        placeholder="Search for address (e.g., Kavisha Amara, Ahmedabad)"
                        autoComplete="off"
                        required
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onFocus={() => addressInput.length > 2 && setShowSuggestions(true)}
                      />
                      {showSuggestions && suggestions.length > 0 && (
                        <ul className="absolute z-10 bg-white border border-gray-200 w-full max-h-48 overflow-y-auto rounded shadow">
                          {suggestions.map((s, idx) => (
                            <li
                              key={idx}
                              className="p-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleSuggestionSelect(s)}
                            >
                              {s.address.freeformAddress}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium mb-1">💡 Tip: You can enter a complete address in the field above, or fill in the details below:</p>
                      <p>Examples: "Kavisha Amara VIP Road, Ahmedabad, Gujarat, India" or "Connaught Place, New Delhi, Delhi, India"</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      name="city"
                      value={formData.location.city}
                      onChange={handleLocationChange}
                      className="input"
                      placeholder="City"
                    />
                    <input
                      type="text"
                      name="state"
                      value={formData.location.state}
                      onChange={handleLocationChange}
                      className="input"
                      placeholder="State/Province"
                    />
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.location.postalCode}
                      onChange={handleLocationChange}
                      className="input"
                      placeholder="Postal Code"
                    />
                    <input
                      type="text"
                      name="country"
                      value={formData.location.country}
                      onChange={handleLocationChange}
                      className="input"
                      placeholder="Country"
                    />
                  </div>

                  {/* Quick Location Buttons */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quick Location Setup
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          location: {
                            ...prev.location,
                            address: "Kavisha Amara VIP Road",
                            city: "Ahmedabad",
                            state: "Gujarat",
                            postalCode: "380058",
                            country: "India"
                          }
                        }))}
                        className="text-xs p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                      >
                        Ahmedabad
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          location: {
                            ...prev.location,
                            address: "Connaught Place",
                            city: "New Delhi",
                            state: "Delhi",
                            postalCode: "110001",
                            country: "India"
                          }
                        }))}
                        className="text-xs p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                      >
                        New Delhi
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          location: {
                            ...prev.location,
                            address: "Marine Drive",
                            city: "Mumbai",
                            state: "Maharashtra",
                            postalCode: "400002",
                            country: "India"
                          }
                        }))}
                        className="text-xs p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                      >
                        Mumbai
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          location: {
                            ...prev.location,
                            address: "MG Road",
                            city: "Bangalore",
                            state: "Karnataka",
                            postalCode: "560001",
                            country: "India"
                          }
                        }))}
                        className="text-xs p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                      >
                        Bangalore
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Attendees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1" />
                  Meeting Attendees
                </label>

                {/* Add Attendee */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="email"
                    name="email"
                    value={newAttendee.email}
                    onChange={handleAttendeeChange}
                    className="input flex-1"
                    placeholder="Email address"
                  />
                  <input
                    type="text"
                    name="name"
                    value={newAttendee.name}
                    onChange={handleAttendeeChange}
                    className="input flex-1"
                    placeholder="Name (optional)"
                  />
                  <button
                    type="button"
                    onClick={addAttendee}
                    className="btn btn-primary px-4"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Attendees List */}
                {formData.attendees.length > 0 && (
                  <div className="space-y-2">
                    {formData.attendees.map((attendee, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {attendee.name || "No name"}
                          </p>
                          <p className="text-sm text-gray-600">{attendee.email}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttendee(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input"
                  rows="3"
                  placeholder="Enter meeting description"
                />
              </div>

              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Booking Summary
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <strong>Date:</strong> {selectedDate.toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Time:</strong> {formatTime(selectedSlot.start)} -{" "}
                    {formatTime(selectedSlot.end)}
                  </p>
                  <p>
                    <strong>Duration:</strong> 30 minutes
                  </p>
                  <p>
                    <strong>Type:</strong> {formData.meetingType === "online" ? "Online" : "In-Person"}
                  </p>
                  {formData.meetingType === "online" && formData.meetingPlatform && (
                    <p>
                      <strong>Platform:</strong> {platforms.find(p => p.value === formData.meetingPlatform)?.name}
                    </p>
                  )}
                  {formData.meetingType === "offline" && formData.location.address && (
                    <p>
                      <strong>Location:</strong> {formData.location.address}
                    </p>
                  )}
                  <p>
                    <strong>Attendees:</strong> {formData.attendees.length} person(s)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !selectedSlot}
            >
              {loading ? (
                <>
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span>Creating Booking...</span>
                  </div>
                </>
              ) : (
                "Book Meeting"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
