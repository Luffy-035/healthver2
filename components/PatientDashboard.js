"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  DollarSign,
  Star,
  Clock,
  User,
  CreditCard,
  MessageCircle,
  Activity,
  Heart,
  Brain,
  Shield,
  Eye,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import BookAppointmentModal from "./BookAppointmentModal";
import ChatModal from "./ChatModal";
import { getPatientAppointments } from "@/actions/appointmentActions";
import { UserButton } from "@clerk/nextjs";

export default function PatientDashboard({ doctors }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointmentForChat, setSelectedAppointmentForChat] =
    useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await getPatientAppointments();
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

  const doctorsByCategory = doctors.reduce((acc, doctor) => {
    if (!acc[doctor.category]) acc[doctor.category] = [];
    acc[doctor.category].push(doctor);
    return acc;
  }, {});

  const categories = ["all", ...Object.keys(doctorsByCategory)];
  const filteredDoctors =
    selectedCategory === "all"
      ? doctors
      : doctorsByCategory[selectedCategory] || [];

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-400/20";
      case "confirmed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-400/20";
      case "completed":
        return "bg-blue-500/10 text-blue-400 border-blue-400/20";
      case "cancelled":
        return "bg-red-500/10 text-red-400 border-red-400/20";
      default:
        return "bg-zinc-700/20 text-zinc-400 border-zinc-500/40";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case "cardiology":
        return <Heart className="h-4 w-4" />;
      case "neurology":
        return <Brain className="h-4 w-4" />;
      case "dermatology":
        return <Shield className="h-4 w-4" />;
      case "ophthalmology":
        return <Eye className="h-4 w-4" />;
      case "general":
        return <Activity className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900/50 to-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent"></div>

      {/* Main Content */}
      <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto z-10">
        <div className="mb-10">
          <div className="backdrop-blur-xl bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="p-4 bg-emerald-500/10 border border-emerald-400/20 rounded-2xl backdrop-blur-sm">
                  <Zap className="h-8 w-8 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-emerald-300 bg-clip-text text-transparent">
                    Patient Dashboard
                  </h1>
                  <p className="text-zinc-400 mt-2 text-lg">
                    Manage your healthcare appointments with AI-powered insights
                  </p>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>

              <Link
                href="/chatbot"
                className="inline-flex items-center justify-center px-5 py-3 text-lg font-medium text-zinc-200 bg-zinc-800/70 border border-zinc-700 rounded-xl hover:bg-zinc-800 hover:text-white hover:border-emerald-600 transition-all duration-300"
              >
                <MessageCircle className="h-5 w-5 mr-2 text-emerald-400" />
                <span>AI Assistant</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <Tabs defaultValue="find-doctors" className="space-y-8">
            <div className="backdrop-blur-xl bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-3 shadow-2xl">
              <TabsList className="grid w-full grid-cols-2 bg-transparent gap-3 h-auto">
                <TabsTrigger
                  value="find-doctors"
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:border-emerald-500 data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/20 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition-all duration-300 border border-zinc-800 rounded-xl py-4 px-6 font-medium bg-zinc-900/70 text-lg"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Find Doctors
                </TabsTrigger>
                <TabsTrigger
                  value="my-appointments"
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:border-emerald-500 data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/20 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition-all duration-300 border border-zinc-800 rounded-xl py-4 px-6 font-medium bg-zinc-900/70 text-lg"
                >
                  <User className="h-5 w-5 mr-2" />
                  My Appointments
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="find-doctors" className="space-y-8">
              <div className="backdrop-blur-xl bg-zinc-900/30 border border-zinc-800/60 shadow-2xl rounded-2xl overflow-hidden">
                <div className="p-6 pb-4">
                  <h2 className="text-white flex items-center space-x-2 text-xl font-semibold">
                    <Shield className="h-5 w-5 text-emerald-400" />
                    <span>Filter by Specialization</span>
                  </h2>
                  <p className="text-zinc-400 text-sm">
                    Choose from our specialized medical categories
                  </p>
                </div>
                <div className="p-6 pt-0">
                  <div className="flex flex-wrap gap-3">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`capitalize transition-all duration-300 rounded-xl px-5 py-3 font-medium border text-lg ${
                          selectedCategory === category
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                            : "bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-700 hover:border-emerald-600"
                        }`}
                      >
                        <span className="flex items-center space-x-2">
                          {category !== "all" && getCategoryIcon(category)}
                          <span>
                            {category === "all" ? "All Doctors" : category}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map((doctor) => (
                    <div
                      key={doctor._id}
                      className="group backdrop-blur-xl bg-zinc-900/30 border border-zinc-800/60 hover:border-emerald-500/40 shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:bg-zinc-900/50 rounded-2xl overflow-hidden relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="p-6 relative">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h2 className="text-xl font-semibold text-white group-hover:text-emerald-300 transition-colors duration-300">
                              Dr. {doctor.name}
                            </h2>
                            <p className="text-lg font-medium text-emerald-400 mt-1">
                              {doctor.specialization}
                            </p>
                          </div>
                          <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 backdrop-blur-sm text-xs font-semibold px-2.5 py-0.5 rounded-full">
                            {doctor.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 pt-0 space-y-4 relative">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-2 text-zinc-400">
                            <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                              <Star className="h-3 w-3 text-emerald-400" />
                            </div>
                            <span>{doctor.experience} years exp</span>
                            <span>₹{doctor.consultationFee}</span>
                          </div>
                        </div>

                        {doctor.qualifications &&
                          doctor.qualifications.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-zinc-300 mb-2">
                                Qualifications:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {doctor.qualifications
                                  .slice(0, 2)
                                  .map((qual, index) => (
                                    <span
                                      key={index}
                                      className="text-xs bg-zinc-800 text-zinc-300 border-zinc-700 font-semibold px-2.5 py-0.5 rounded-full"
                                    >
                                      {qual}
                                    </span>
                                  ))}
                                {doctor.qualifications.length > 2 && (
                                  <span className="text-xs bg-zinc-800 text-zinc-300 border-zinc-700 font-semibold px-2.5 py-0.5 rounded-full">
                                    +{doctor.qualifications.length - 2} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                        <button
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-[1.02] rounded-xl py-3 font-medium text-lg inline-flex items-center justify-center"
                          onClick={() => handleBookAppointment(doctor)}
                        >
                          <Calendar className="h-5 w-5 mr-2" />
                          Book Appointment
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full">
                    <div className="backdrop-blur-xl bg-zinc-900/30 border border-zinc-800/60 shadow-2xl rounded-2xl">
                      <div className="text-center p-6 py-16">
                        <div className="p-4 bg-zinc-800/50 rounded-2xl w-fit mx-auto mb-6">
                          <Activity className="h-16 w-16 text-zinc-500 mx-auto" />
                        </div>
                        <h3 className="text-xl font-semibold text-zinc-200 mb-2">
                          No doctors found
                        </h3>
                        <p className="text-zinc-400">
                          {selectedCategory === "all"
                            ? "No approved doctors available at the moment."
                            : `No doctors found in ${selectedCategory} category.`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="my-appointments" className="space-y-8">
              {loading ? (
                <div className="backdrop-blur-xl bg-zinc-900/30 border border-zinc-800/60 shadow-2xl rounded-2xl">
                  <div className="text-center p-6 py-12">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                      <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
                      <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse delay-150"></div>
                      <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse delay-300"></div>
                    </div>
                    <span className="text-zinc-400 text-lg">
                      Loading appointments...
                    </span>
                  </div>
                </div>
              ) : appointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="backdrop-blur-xl bg-zinc-900/30 border border-zinc-800/60 hover:border-emerald-500/40 shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 rounded-2xl overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h2 className="text-lg font-semibold text-white">
                              Dr. {appointment.doctor.name}
                            </h2>
                            <p className="text-emerald-400 text-sm">
                              {appointment.doctor.specialization}
                            </p>
                          </div>
                          <span
                            className={`${getStatusColor(
                              appointment.status
                            )} backdrop-blur-sm border font-medium text-xs px-2.5 py-0.5 rounded-full`}
                          >
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 pt-0 space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-zinc-400">
                            <div className="p-1.5 bg-emerald-500/10 rounded-lg mr-3">
                              <Calendar className="h-3 w-3 text-emerald-400" />
                            </div>
                            <span>
                              {new Date(
                                appointment.appointmentDate
                              ).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-zinc-400">
                            <div className="p-1.5 bg-emerald-500/10 rounded-lg mr-3">
                              <Clock className="h-3 w-3 text-emerald-400" />
                            </div>
                            <span>
                              {new Date(
                                appointment.appointmentDate
                              ).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>

                        {appointment.paymentId && appointment.amount && (
                          <div className="flex items-center justify-between text-sm bg-emerald-500/10 rounded-xl p-3 border border-emerald-400/20">
                            <div className="flex items-center text-emerald-300">
                              <CreditCard className="h-4 w-4 mr-2" />
                              <span>Payment: ₹{appointment.amount}</span>
                            </div>
                            <span className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                              Paid
                            </span>
                          </div>
                        )}

                        {appointment.reason && (
                          <div className="text-sm bg-zinc-800/70 rounded-xl p-3">
                            <span className="font-medium text-zinc-300">
                              Reason:{" "}
                            </span>
                            <span className="text-zinc-400">
                              {appointment.reason}
                            </span>
                          </div>
                        )}

                        {appointment.notes && (
                          <div className="text-sm bg-zinc-800/70 rounded-xl p-3">
                            <span className="font-medium text-zinc-300">
                              Doctor's Notes:{" "}
                            </span>
                            <span className="text-zinc-400">
                              {appointment.notes}
                            </span>
                          </div>
                        )}

                        {appointment.status === "confirmed" && (
                          <div className="pt-2">
                            <button
                              onClick={() => handleOpenChat(appointment)}
                              className="w-full bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-700 hover:border-emerald-600 transition-all duration-300 rounded-xl h-9 px-3 inline-flex items-center justify-center text-sm"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Chat with Doctor
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="backdrop-blur-xl bg-zinc-900/30 border border-zinc-800/60 shadow-2xl rounded-2xl">
                  <div className="p-6 text-center py-16">
                    <div className="p-4 bg-zinc-800/50 rounded-2xl w-fit mx-auto mb-6">
                      <User className="h-16 w-16 text-zinc-500 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-200 mb-2">
                      No Appointments Yet
                    </h3>
                    <p className="text-zinc-400 mb-8">
                      Book your first appointment with a doctor
                    </p>
                    <button
                      onClick={() =>
                        document
                          .querySelector(
                            '[data-radix-collection-item][value="find-doctors"]'
                          )
                          .click()
                      }
                      className="bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 rounded-xl px-6 py-2.5 inline-flex items-center justify-center"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Find Doctors
                    </button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {selectedDoctor && (
          <BookAppointmentModal
            doctor={selectedDoctor}
            isOpen={isBookingModalOpen}
            onClose={() => {
              setIsBookingModalOpen(false);
              setSelectedDoctor(null);
              fetchAppointments();
            }}
          />
        )}
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
