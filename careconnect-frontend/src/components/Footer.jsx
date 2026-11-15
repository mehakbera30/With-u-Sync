import React from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import siteConfig from "../config/siteConfig";

const linkClass =
  "text-slate-400 hover:text-white transition text-[0.95rem]";

// Brand icons drawn inline (the icon library has no brand logos)
const svgProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const WhatsAppIcon = () => (
  <svg {...svgProps}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    <g transform="translate(6.2 5.8) scale(0.5)">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </g>
  </svg>
);

const InstagramIcon = () => (
  <svg {...svgProps}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = () => (
  <svg {...svgProps}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

// A WhatsApp value can be a full link or just the phone number
const whatsappLink = (value) =>
  /^https?:\/\//i.test(value)
    ? value
    : `https://wa.me/${String(value).replace(/\D/g, "")}`;

const buildSocials = (social = {}) =>
  [
    social.whatsapp && {
      label: "WhatsApp",
      href: whatsappLink(social.whatsapp),
      icon: <WhatsAppIcon />,
      color: "bg-[#25D366]",
    },
    social.instagram && {
      label: "Instagram",
      href: social.instagram,
      icon: <InstagramIcon />,
      color: "bg-[#E1306C]",
    },
    social.facebook && {
      label: "Facebook",
      href: social.facebook,
      icon: <FacebookIcon />,
      color: "bg-[#1877F2]",
    },
  ].filter(Boolean);

const Footer = () => {
  const socials = buildSocials(siteConfig.social);

  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1.3fr] gap-10 lg:gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="w-12 h-12 rounded-xl overflow-hidden bg-white flex items-center justify-center">
                <img
                  src="/withusync-logo.png"
                  alt={siteConfig.name}
                  className="w-full h-full object-contain"
                />
              </span>
              <span className="text-2xl font-bold text-white">
                {siteConfig.name}
              </span>
            </Link>

            <p className="mt-5 max-w-md text-slate-400 leading-relaxed">
              {siteConfig.description}
            </p>

            <ul className="mt-6 space-y-3 text-slate-300">
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-teal-400 shrink-0" />
                <a href={`mailto:${siteConfig.email}`} className="hover:text-white break-all">
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-teal-400 shrink-0" />
                <a
                  href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
                  className="hover:text-white"
                >
                  {siteConfig.phone}
                </a>
              </li>
            </ul>

            {socials.length > 0 && (
              <div className="mt-6 flex items-center gap-3">
                {socials.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    title={item.label}
                    className={`w-11 h-11 rounded-full ${item.color} text-white flex items-center justify-center hover:scale-105 transition`}
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Patients */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-5">Patients</h4>
            <ul className="space-y-3">
              <li><Link to="/register" className={linkClass}>Create an account</Link></li>
              <li><Link to="/patient/appointments" className={linkClass}>My appointments</Link></li>
              <li><Link to="/patient/prescriptions" className={linkClass}>My prescriptions</Link></li>
              <li><Link to="/patient/reports" className={linkClass}>My reports</Link></li>
            </ul>
          </div>

          {/* Professionals */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-5">Professionals</h4>
            <ul className="space-y-3">
              <li><Link to="/register" className={linkClass}>Join as a doctor</Link></li>
              <li><Link to="/doctor/dashboard" className={linkClass}>Doctor portal</Link></li>
              <li><Link to="/admin/dashboard" className={linkClass}>Admin portal</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-5">Contact</h4>
            <ul className="space-y-3 text-slate-400">
              <li className="flex items-center gap-3">
                <MapPin size={18} className="text-teal-400 shrink-0" />
                {siteConfig.location}
              </li>
              <li className="flex items-center gap-3">
                <Clock size={18} className="text-teal-400 shrink-0" />
                {siteConfig.supportHours}
              </li>
            </ul>

            <a
              href={`mailto:${siteConfig.email}`}
              className="inline-block mt-5 font-semibold text-white hover:text-teal-300 transition"
            >
              Contact support
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/about" className="hover:text-white">About Us</Link>
            <Link to="/faq" className="hover:text-white">FAQ</Link>
            <Link to="/login" className="hover:text-white">Login</Link>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-600 text-center sm:text-left">
          {siteConfig.name} helps you organise your care. It does not provide medical advice and is not
          for emergencies. In an emergency, call your local emergency number (112 in India).
        </p>
      </div>
    </footer>
  );
};

export default Footer;
