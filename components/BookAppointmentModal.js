"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { createAppointment } from "@/actions/appointmentActions";
import { createPaymentOrder, verifyPayment } from "@/actions/paymentActions";
import { CalendarDays, Clock, CreditCard, CheckCircle } from "lucide-react";



export default function BookAppointmentModal({ doctor, isOpen, onClose }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState('booking'); // 'booking', 'success'

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.head.appendChild(script);
      });
    };

    if (isOpen) {
      loadRazorpay();
    }
  }, [isOpen]);

  const handlePayment = async () => {
    if (!selectedDate || !selectedSlot) {
      alert('Please select date and time slot');
      return;
    }

    if (!window.Razorpay) {
      alert('Payment system is loading. Please try again.');
      return;
    }

    setLoading(true);

    try {
      console.log('Creating payment order for doctor:', doctor._id);
      const orderData = await createPaymentOrder(doctor._id);
      console.log('Payment order created:', orderData);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "HealthCare Connect",
        description: `Consultation with ${doctor.name}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          console.log('Payment response received:', response);
          
          try {
            // Verify payment with exact field names from Razorpay
            const verificationResult = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            console.log('Payment verification result:', verificationResult);

            if (verificationResult.success) {
              // Create appointment after successful payment
              const appointmentDateTime = new Date(selectedDate);
              const [hours, minutes] = selectedSlot.split(':');
              appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

              const appointmentResult = await createAppointment({
                doctorId: doctor._id,
                appointmentDate: appointmentDateTime.toISOString(),
                reason,
                paymentId: verificationResult.paymentId
              });

              console.log('Appointment created:', appointmentResult);
              setPaymentStep('success');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert(`Payment verification failed: ${error.message}. Please contact support with payment ID: ${response.razorpay_payment_id}`);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: "Patient",
          email: "patient@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3b82f6",
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            setLoading(false);
          }
        }
      };

      console.log('Opening Razorpay with options:', options);
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert('Failed to initiate payment: ' + error.message);
      setLoading(false);
    }
  };

  const getAvailableSlots = () => {
    if (!selectedDate) return [];
    
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    const availability = doctor.availability?.find(avail => avail.day === dayName);
    
    return availability?.slots || [];
  };

  const isDateAvailable = (date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return doctor.availability?.some(avail => avail.day === dayName && avail.slots.length > 0);
  };

  const handleClose = () => {
    setSelectedDate(null);
    setSelectedSlot('');
    setReason('');
    setPaymentStep('booking');
    setLoading(false);
    onClose();
  };

  if (paymentStep === 'success') {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-fit">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Appointment Booked!</h3>
            <p className="text-gray-600 mb-6">
              Your appointment with {doctor.name} has been successfully booked and confirmed.
            </p>
            <Button onClick={handleClose} className="w-full">
              View My Appointments
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Book Appointment</DialogTitle>
          <DialogDescription>
            Schedule an appointment with {doctor.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Doctor Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg">{doctor.name}</h3>
            <p className="text-blue-600">{doctor.specialization}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center">
                ₹{doctor.consultationFee}
              </span>
              <Badge variant="secondary">{doctor.category}</Badge>
            </div>
          </div>

          <div className="space-y-6">
            {/* Calendar */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                <CalendarDays className="h-4 w-4 inline mr-2" />
                Select Date
              </Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || !isDateAvailable(date)}
                className="rounded-md border"
              />
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Available Time Slots
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {getAvailableSlots().map((slot) => (
                    <Button
                      key={slot}
                      type="button"
                      variant={selectedSlot === slot ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
                {getAvailableSlots().length === 0 && (
                  <p className="text-gray-500 text-sm">No slots available for this day</p>
                )}
              </div>
            )}

            {/* Reason */}
            <div>
              <Label htmlFor="reason">Reason for Visit (Optional)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Brief description of your symptoms or reason for consultation"
                rows={3}
              />
            </div>

            {/* Payment Summary */}
            {selectedDate && selectedSlot && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Appointment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{selectedDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span>{selectedSlot}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Consultation Fee:</span>
                    <span>₹{doctor.consultationFee}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex space-x-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handlePayment}
                disabled={loading || !selectedDate || !selectedSlot}
                className="flex-1"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {loading ? "Processing..." : `Pay ₹${doctor.consultationFee} & Book`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
