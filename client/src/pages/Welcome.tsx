import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import hotelPhoto from "../../public/hotelphoto.png";
import hotelLogo from "../../public/HDP_LOGO.jpeg";

const hotelName = "Hotel Dixit Palace";
const hotelTagline = "one step close to paradise";
const hotelMapEmbed =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14014.230659823766!2d78.55317302115479!3d25.39765112180839!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39777637dc1640a5%3A0xaf77db0b893b6a36!2sHotel%20Dixit%20Palace%2C%20Jhansi%20Rd%2C%20Kamad%2C%20Ramnagar%2C%20Madhya%20Pradesh%20475661!5e0!3m2!1sen!2sin!4v1697530997488!5m2!1sen!2sin";

const lavishGold = "from-[#ceb478] via-[#efd490] to-[#c9a741]";

const Welcome = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  useEffect(() => setIsVisible(true), []);

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center relative overflow-hidden hide-scrollbar">
      <Fingerprint
        className="  animate-rotateYSlow w-14 h-14 text-yellow-400 animate-pulse  hover:from-yellow-400 hover:to-yellow-600"
        style={{
          position: "absolute",
          left: "100px",
          top: "25px",

        }}
      />
      {/* Top Center Logo */}

      <div
        className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center transition-all duration-1000 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
      >
        <img
          src={hotelLogo}
          alt="Hotel Dixit Palace Logo"
          className="rounded-full w-36 h-36 border-8 shadow-lg object-cover border-yellow-400 bg-card "
          style={{
            boxShadow: "0 0 70px #efd49077",
            position: "relative",
            right: 70,
            transformStyle: "preserve-3d",
          }}
          draggable="false"
        />

        <span
          style={{ position: "relative", right: 70 }}
          className="mt-3 text-xl font-bold tracking-wider text-yellow-400 drop-shadow"
        >
          Est. 2024
        </span>
      </div>

      {/* Two-Column Body */}
      <div
        className={`flex flex-col md:flex-row items-stretch w-full h-screen pt-48 md:pt-32 px-6 md:px-12 transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Left: Content */}
        <div className="w-full md:w-1/2 flex flex-col justify-center gap-8 md:pl-12 overflow-hidden">
          {/* Info */}
          <div className="space-y-5 text-left max-w-lg font-['Playfair_Display']">
            <h1
              className={`text-5xl font-extrabold bg-gradient-to-r ${lavishGold} bg-clip-text text-transparent drop-shadow-lg tracking-wide`}
            >
              {hotelName}
            </h1>
            <div className="text-2xl font-semibold uppercase text-yellow-400 tracking-widest">
              {hotelTagline}
            </div>
            <p className="text-lg text-yellow-100 drop-shadow leading-relaxed">
              Welcome to the next generation of staff management for luxury
              hospitality.
              <br />
              <span className="font-bold text-yellow-400">BiometriQ</span>{" "}
              ensures secure, fast, and intelligent attendance and payroll
              tailored for premium hotels.
            </p>
            <div className="flex items-center gap-3 mb-1">
              <Fingerprint className="w-8 h-8 text-yellow-400 animate-pulse" />
              <span className="text-yellow-300 font-bold text-lg">
                Biometric Smart System
              </span>
            </div>
          </div>

          {/* Map */}
          {/* <div className="w-full max-w-md rounded-2xl border-4 border-yellow-400 shadow-lg overflow-hidden h-80">
            <iframe
              src={hotelMapEmbed}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Hotel Dixit Palace Map"
            />
          </div> */}

          {/* Button */}
          <div className="pt-2">
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="bg-gradient-to-r from-yellow-400 mb-2 to-yellow-600 hover:from-yellow-300 hover:to-yellow-600 text-black font-extrabold px-16 py-5 text-xl rounded-full shadow-lg border-none"
              style={{ boxShadow: "0 0 42px #efd490cc" }}
            >
              Enter System
            </Button>
          </div>
        </div>

        {/* Right: Hotel Photo */}
        <div className="w-full md:w-[690px] h-full flex justify-start items-center">
          <img
            src={hotelPhoto}
            alt="Hotel Dixit Palace"
            className="w-full h-[80vh] object-cover rounded-l-3xl md:rounded-r-3xl shadow-2xl border-4 border-yellow-400 bg-card ml-10"
            draggable="false"
          />
        </div>
      </div>
    </div>
  );
};

export default Welcome;
