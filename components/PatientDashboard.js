"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, DollarSign, Star, Clock, User, CreditCard, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import BookAppointmentModal from "./BookAppointmentModal";
import ChatModal from "./ChatModal";
import { getPatientAppointments } from "@/actions/appointmentActions";

export default function PatientDashboard({ doctors }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chat states
  const [selectedAppointmentForChat, setSelectedAppointmentForChat] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      console.log("Fetching patient appointments...");
      const data = await getPatientAppointments();
      console.log("Received appointments:", data);
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor);
    setIsBookingModalOpen(true);
  };

  const handleOpenChat = (appointment) => {
    setSelectedAppointmentForChat(appointment);
    setIsChatModalOpen(true);
  };

  // Group doctors by category
  const doctorsByCategory = doctors.reduce((acc, doctor) => {
    if (!acc[doctor.category]) {
      acc[doctor.category] = [];
    }
    acc[doctor.category].push(doctor);
    return acc;
  }, {});

  const categories = ["all", ...Object.keys(doctorsByCategory)];
  const filteredDoctors = selectedCategory === "all" ? doctors : doctorsByCategory[selectedCategory] || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your healthcare appointments</p>
        </div>

        <Tabs defaultValue="find-doctors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="find-doctors">Find Doctors</TabsTrigger>
            <TabsTrigger value="my-appointments">My Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="find-doctors" className="space-y-6">
            {/* Category Filter */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Filter by Category</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize"
                  >
                    {category === "all" ? "All Doctors" : category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor) => (
                  <Card key={doctor._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">Dr. {doctor.name}</CardTitle>
                          <CardDescription className="text-lg font-medium text-blue-600">
                            {doctor.specialization}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">{doctor.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1" />
                          <span>{doctor.experience} years exp</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span>₹{doctor.consultationFee}</span>
                        </div>
                      </div>

                      {doctor.qualifications && doctor.qualifications.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Qualifications:</p>
                          <div className="flex flex-wrap gap-1">
                            {doctor.qualifications.slice(0, 2).map((qual, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {qual}
                              </Badge>
                            ))}
                            {doctor.qualifications.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{doctor.qualifications.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={() => handleBookAppointment(doctor)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Appointment
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <h3 className="text-xl font-semibold text-gray-500 mb-2">No doctors found</h3>
                  <p className="text-gray-400">
                    {selectedCategory === "all" 
                      ? "No approved doctors available at the moment." 
                      : `No doctors found in ${selectedCategory} category.`
                    }
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="my-appointments" className="space-y-6">
            {loading ? (
              <div className="text-center py-8">Loading appointments...</div>
            ) : appointments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appointments.map((appointment) => (
                  <Card key={appointment._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">Dr. {appointment.doctor.name}</CardTitle>
                          <CardDescription>{appointment.doctor.specialization}</CardDescription>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {new Date(appointment.appointmentDate).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      {/* Payment Status Section */}
                      {appointment.paymentId && appointment.amount && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-green-600">
                            <CreditCard className="h-4 w-4 mr-2" />
                            <span>Payment: ₹{appointment.amount}</span>
                          </div>
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Paid
                          </Badge>
                        </div>
                      )}
                      
                      {appointment.reason && (
                        <div className="text-sm">
                          <span className="font-medium">Reason: </span>
                          <span className="text-gray-600">{appointment.reason}</span>
                        </div>
                      )}
                      {appointment.notes && (
                        <div className="text-sm">
                          <span className="font-medium">Doctor's Notes: </span>
                          <span className="text-gray-600">{appointment.notes}</span>
                        </div>
                      )}

                      {/* Chat Button - Only show for confirmed appointments */}
                      {appointment.status === 'confirmed' && (
                        <div className="pt-3 border-t">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOpenChat(appointment)}
                            className="w-full"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Chat with Doctor
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-500 mb-2">No Appointments Yet</h3>
                  <p className="text-gray-400 mb-6">Book your first appointment with a doctor</p>
                  <Button onClick={() => setSelectedCategory("all")}>
                    Find Doctors
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Booking Modal */}
        {selectedDoctor && (
          <BookAppointmentModal
            doctor={selectedDoctor}
            isOpen={isBookingModalOpen}
            onClose={() => {
              setIsBookingModalOpen(false);
              setSelectedDoctor(null);
              fetchAppointments(); // Refresh appointments after booking
            }}
          />
        )}

        {/* Chat Modal */}
        {selectedAppointmentForChat && (
          <ChatModal
            appointment={selectedAppointmentForChat}
            isOpen={isChatModalOpen}
            onClose={() => {
              setIsChatModalOpen(false);
              setSelectedAppointmentForChat(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
