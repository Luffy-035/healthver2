"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, DollarSign, AlertCircle, CheckCircle, XCircle, CreditCard, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { getDoctorAppointments, updateAppointmentStatus } from "@/actions/appointmentActions";
import ChatModal from "./ChatModal";

export default function DoctorDashboard({ doctor }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingAppointment, setUpdatingAppointment] = useState(null);

  // Chat states
  const [selectedAppointmentForChat, setSelectedAppointmentForChat] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  useEffect(() => {
    if (doctor.status === 'approved') {
      fetchAppointments();
    }
  }, [doctor.status]);

  const fetchAppointments = async () => {
    try {
      const data = await getDoctorAppointments();
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, status, notes = '') => {
    setUpdatingAppointment(appointmentId);
    try {
      await updateAppointmentStatus(appointmentId, status, notes);
      await fetchAppointments(); // Refresh appointments
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("Failed to update appointment");
    } finally {
      setUpdatingAppointment(null);
    }
  };

  const handleOpenChat = (appointment) => {
    setSelectedAppointmentForChat(appointment);
    setIsChatModalOpen(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'pending':
        return "Your profile is under review. You'll be notified once approved.";
      case 'approved':
        return "Your profile is approved! You can now manage appointments.";
      case 'rejected':
        return "Your application was rejected. Please contact support for more information.";
      default:
        return "Unknown status.";
    }
  };

  const getAppointmentStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const todayAppointments = appointments.filter(apt => {
    const today = new Date().toDateString();
    return new Date(apt.appointmentDate).toDateString() === today;
  });

  const totalRevenue = appointments
    .filter(apt => apt.status === 'completed' && apt.amount)
    .reduce((sum, apt) => sum + apt.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, Dr. {doctor.name}</p>
        </div>

        {/* Status Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center space-x-2">
              {getStatusIcon(doctor.status)}
              <CardTitle className="text-xl">Profile Status</CardTitle>
              <Badge 
                variant={doctor.status === 'approved' ? 'default' : doctor.status === 'pending' ? 'secondary' : 'destructive'}
              >
                {doctor.status.charAt(0).toUpperCase() + doctor.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{getStatusMessage(doctor.status)}</p>
          </CardContent>
        </Card>

        {doctor.status === 'approved' ? (
          <Tabs defaultValue="appointments" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="appointments" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Today's Appointments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      {todayAppointments.length}
                    </div>
                    <p className="text-sm text-gray-500">
                      {todayAppointments.length === 0 ? "No appointments today" : "scheduled for today"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Appointments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {appointments.length}
                    </div>
                    <p className="text-sm text-gray-500">All time</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Pending Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-600">
                      {appointments.filter(apt => apt.status === 'pending').length}
                    </div>
                    <p className="text-sm text-gray-500">Awaiting confirmation</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      ₹{totalRevenue}
                    </div>
                    <p className="text-sm text-gray-500">From completed appointments</p>
                  </CardContent>
                </Card>
              </div>

              {/* Appointments List */}
              <Card>
                <CardHeader>
                  <CardTitle>All Appointments</CardTitle>
                  <CardDescription>Manage your patient appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading appointments...</div>
                  ) : appointments.length > 0 ? (
                    <div className="space-y-4">
                      {appointments.map((appointment) => (
                        <div key={appointment._id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">{appointment.patient.name}</span>
                                <Badge className={getAppointmentStatusColor(appointment.status)}>
                                  {appointment.status}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  <span>
                                    {new Date(appointment.appointmentDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  <span>
                                    {new Date(appointment.appointmentDate).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                
                                {/* Payment Status */}
                                {appointment.amount && (
                                  <div className="flex items-center text-green-600">
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    <span>₹{appointment.amount}</span>
                                  </div>
                                )}
                              </div>
                              
                              {appointment.reason && (
                                <p className="text-sm">
                                  <span className="font-medium">Reason: </span>
                                  {appointment.reason}
                                </p>
                              )}
                            </div>
                            
                            {/* Payment Badge */}
                            {appointment.paymentId && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                Paid
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center space-x-4">
                            <Select 
                              value={appointment.status}
                              onValueChange={(value) => handleStatusUpdate(appointment._id, value)}
                              disabled={updatingAppointment === appointment._id}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>

                            {/* Chat Button - Only show for confirmed appointments */}
                            {appointment.status === 'confirmed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenChat(appointment)}
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Chat
                              </Button>
                            )}

                            <div className="flex-1">
                              <Textarea
                                placeholder="Add notes for this appointment..."
                                value={appointment.notes || ''}
                                onChange={(e) => {
                                  // Update local state
                                  setAppointments(prev =>
                                    prev.map(apt =>
                                      apt._id === appointment._id
                                        ? { ...apt, notes: e.target.value }
                                        : apt
                                    )
                                  );
                                }}
                                onBlur={(e) => {
                                  // Save notes when user clicks away
                                  if (e.target.value !== (appointment.originalNotes || '')) {
                                    handleStatusUpdate(appointment._id, appointment.status, e.target.value);
                                  }
                                }}
                                rows={2}
                                className="text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-500 mb-2">No Appointments Yet</h3>
                      <p className="text-gray-400">Patients will be able to book appointments with you once your profile is approved.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              {/* Profile Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Profile Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Specialization</label>
                      <p className="text-lg">{doctor.specialization}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Category</label>
                      <p className="text-lg">{doctor.category}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Experience</label>
                      <p className="text-lg">{doctor.experience} years</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Consultation Fee</label>
                      <p className="text-lg flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        ₹{doctor.consultationFee}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Qualifications</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {doctor.qualifications?.map((qual, index) => (
                        <Badge key={index} variant="outline">{qual}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Availability</label>
                    <div className="mt-2 space-y-2">
                      {doctor.availability?.map((avail, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{avail.day}:</span>
                          <div className="flex space-x-1">
                            {avail.slots?.map((slot, slotIndex) => (
                              <Badge key={slotIndex} variant="secondary" className="text-xs">
                                {slot}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : doctor.status === 'pending' ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Profile Under Review</h3>
              <p className="text-gray-600 mb-6">
                Thank you for submitting your profile. Our team is reviewing your application and will notify you once it's approved.
              </p>
              <Button variant="outline">Contact Support</Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Application Rejected</h3>
              <p className="text-gray-600 mb-6">
                Unfortunately, your application was not approved. Please contact our support team for more information.
              </p>
              <Button variant="outline">Contact Support</Button>
            </CardContent>
          </Card>
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
