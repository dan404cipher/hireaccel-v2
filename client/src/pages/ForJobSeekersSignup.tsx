import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import logoColor from "@/assets/logo-color.png";
import heroBackground from "@/assets/Hero-background.jpeg";

const ForJobSeekersSignup = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleContinue = () => {
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      return;
    }
    const params = new URLSearchParams();
    if (fullName) params.set("name", fullName);
    if (email) params.set("email", email);
    if (phone) params.set("phone", phone);
    navigate(`/signup/candidate?${params.toString()}`);
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-transparent"></div>

        <div className="relative z-10 flex flex-col h-full">
          <div
            className="flex-shrink-0 p-8"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            <div className="flex items-center gap-3">
              <img src={logoColor} alt="HireAccel Logo" className="w-12 h-12" />
              <div>
                <h1 className="font-bold text-white text-xl">Hire Accel</h1>
                <p className="text-xs text-white/80 font-medium">
                  powered by v-accel
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center px-8">
            <div className="mb-8">
              <h1 className="max-w-xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Get started as a{" "}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Job Seeker
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/80">
                Share your contact details and continue to complete your
                Candidate signup.
              </p>
            </div>
          </div>

          <div className="flex-shrink-0 px-8 pb-8 w-full">
            <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl w-full">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    5000+
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    Active Users
                  </div>
                </div>
                <div className="text-center p-4 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    200+
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    Companies
                  </div>
                </div>
                <div className="text-center p-4 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    24/7
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    Support
                  </div>
                </div>
                <div className="text-center p-4 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    98%
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    Success Rate
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-1 mb-4">
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-purple-500">Create Account as a Job Seeker</span>
              </div>
              <p className="text-gray-600">
                Join our platform and start your job search journey
              </p>
            </div>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleContinue();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name*</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email*</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number*</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 555 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2"
              >
                Continue as a Job Seeker →
              </Button>
            </form>

            <div className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:underline"
              >
                Sign in here
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForJobSeekersSignup;
