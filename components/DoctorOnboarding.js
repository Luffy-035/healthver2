"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { createDoctorProfile } from "@/actions/doctorActions";
import { Stethoscope, User, GraduationCap, Clock } from "lucide-react";

const CATEGORIES = [
  "Cardiology",
  "Dermatology", 
  "Pediatrics",
  "Orthopedics",
  "Neurology",
  "Gynecology",
  "ENT",
  "Psychiatry",
  "General Medicine",
  "Surgery"
];

const DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00"
];

export default function DoctorOnboarding() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    specialization: "",
    category: "",
    experience: "",
    qualifications: "",
    consultationFee: "",
    availability: DAYS.map(day => ({ day, slots: [], selected: false }))
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDayToggle = (dayIndex) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.map((avail, index) => 
        index === dayIndex 
          ? { ...avail, selected: !avail.selected, slots: !avail.selected ? [] : avail.slots }
          : avail
      )
    }));
  };

  const handleSlotToggle = (dayIndex, slot) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.map((avail, index) => 
        index === dayIndex 
          ? {
              ...avail,
              slots: avail.slots.includes(slot)
                ? avail.slots.filter(s => s !== slot)
                : [...avail.slots, slot].sort()
            }
          : avail
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const qualificationsArray = formData.qualifications
        .split(',')
        .map(q => q.trim())
        .filter(q => q.length > 0);

      const availabilityData = formData.availability
        .filter(avail => avail.selected && avail.slots.length > 0)
        .map(avail => ({
          day: avail.day,
          slots: avail.slots
        }));

      const doctorData = {
        name: formData.name,
        phone: formData.phone,
        specialization: formData.specialization,
        category: formData.category,
        experience: parseInt(formData.experience),
        qualifications: qualificationsArray,
        consultationFee: parseFloat(formData.consultationFee),
        availability: availabilityData
      };

      await createDoctorProfile(doctorData);
    } catch (error) {
      console.error("Error creating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Stethoscope className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-gray-600 mt-2">Help patients find you by completing your medical profile</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>Professional Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specialization">Specialization *</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                    placeholder="e.g. Internal Medicine"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category.toLowerCase()}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="consultationFee">Consultation Fee ($) *</Label>
                  <Input
                    id="consultationFee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.consultationFee}
                    onChange={(e) => handleInputChange('consultationFee', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="qualifications">Qualifications *</Label>
                <Textarea
                  id="qualifications"
                  value={formData.qualifications}
                  onChange={(e) => handleInputChange('qualifications', e.target.value)}
                  placeholder="Enter qualifications separated by commas (e.g. MBBS, MD Internal Medicine, Fellowship in Cardiology)"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Separate multiple qualifications with commas</p>
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Availability</span>
              </CardTitle>
              <CardDescription>
                Select the days and time slots when you're available for consultations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.availability.map((dayAvail, dayIndex) => (
                <div key={dayAvail.day} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={dayAvail.day}
                      checked={dayAvail.selected}
                      onCheckedChange={() => handleDayToggle(dayIndex)}
                    />
                    <Label htmlFor={dayAvail.day} className="text-lg font-medium">
                      {dayAvail.day}
                    </Label>
                  </div>
                  
                  {dayAvail.selected && (
                    <div className="ml-6 space-y-2">
                      <p className="text-sm text-gray-600">Select available time slots:</p>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {TIME_SLOTS.map((slot) => (
                          <Button
                            key={slot}
                            type="button"
                            variant={dayAvail.slots.includes(slot) ? "default" : "outline"}
                            size="sm"
                            className="text-xs"
                            onClick={() => handleSlotToggle(dayIndex, slot)}
                          >
                            {slot}
                          </Button>
                        ))}
                      </div>
                      {dayAvail.slots.length > 0 && (
                        <p className="text-sm text-green-600">
                          Selected: {dayAvail.slots.length} slots
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Submit */}
          <Card>
            <CardContent className="pt-6">
              <Button 
                type="submit" 
                size="lg" 
                className="w-full"
                disabled={loading}
              >
                {loading ? "Creating Profile..." : "Submit for Review"}
              </Button>
              <p className="text-sm text-gray-500 text-center mt-4">
                Your profile will be reviewed by our team and you'll be notified once approved.
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
