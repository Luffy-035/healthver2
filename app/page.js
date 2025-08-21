import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import RoleSelection from "@/components/RoleSelection";

export default async function Home() {
  const { userId, sessionClaims } = await auth();
  
  // If user is already signed in and has a role, redirect them
  if (userId && sessionClaims?.role?.role) {
      const role = sessionClaims.role?.role;
      console.log(role)
    if (role === 'patient') {
      redirect('/patient');
    } else if (role === 'doctor') {
      redirect('/doctor');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            HealthCare Connect
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect patients with qualified doctors for seamless healthcare appointments
          </p>
        </div>

        {/* Role Selection Cards */}
        <RoleSelection />
      </div>
    </div>
  );
}
