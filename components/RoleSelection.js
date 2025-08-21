"use client";

import { useUser, SignInButton } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, Users } from "lucide-react";
import { setUserRole } from "@/actions/userActions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RoleSelection() {
  const { isSignedIn, user } = useUser();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRoleSelection = async (role) => {
    if (!isSignedIn) {
      return;
    }

    setLoading(true);
    try {
      const result = await setUserRole(role);
      
      if (result.success) {
        // Force session reload to get updated metadata
        await user.reload();
        
        // Handle redirect based on result
        if (role === "doctor" && result.needsOnboarding) {
          router.push("/doctor/onboarding");
        } else if (role === "doctor") {
          router.push("/doctor");
        } else {
          router.push("/patient");
        }
      }
    } catch (error) {
      console.error("Error setting role:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Patient Card */}
      <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-500">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-fit">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Continue as Patient</CardTitle>
          <CardDescription className="text-lg">
            Book appointments with qualified doctors
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Browse doctors by specialization
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Book appointments online
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Manage your appointments
            </div>
          </div>
          
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <Button className="w-full" size="lg">
                Sign In as Patient
              </Button>
            </SignInButton>
          ) : (
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => handleRoleSelection("patient")}
              disabled={loading}
            >
              {loading ? "Setting up..." : "Continue as Patient"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Doctor Card */}
      <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-500">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-fit">
            <Stethoscope className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Continue as Doctor</CardTitle>
          <CardDescription className="text-lg">
            Manage your practice and appointments
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Manage your appointments
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Set your availability
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Connect with patients
            </div>
          </div>
          
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                Sign In as Doctor
              </Button>
            </SignInButton>
          ) : (
            <Button 
              className="w-full bg-green-600 hover:bg-green-700" 
              size="lg"
              onClick={() => handleRoleSelection("doctor")}
              disabled={loading}
            >
              {loading ? "Setting up..." : "Continue as Doctor"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
