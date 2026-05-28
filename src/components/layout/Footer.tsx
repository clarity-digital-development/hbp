import Link from "next/link";
import { Instagram, Facebook, Mail, Phone } from "lucide-react";

const quickLinks = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/investment", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-display text-3xl mb-4">Hailey Brooke</h3>
            <p className="text-warm-beige text-sm leading-relaxed">
              Capturing your story, one frame at a time. Based in Kentucky,
              available for travel worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-xl mb-4">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-warm-beige hover:text-white text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-xl mb-4">Get in Touch</h4>
            <div className="flex flex-col gap-3 text-sm text-warm-beige">
              <a
                href="mailto:haileybrookephotography@outlook.com"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Mail size={16} />
                haileybrookephotography@outlook.com
              </a>
              <a
                href="tel:502-837-0871"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Phone size={16} />
                502-837-0871
              </a>
              <div className="flex gap-4 mt-4">
                <a
                  href="https://instagram.com/haileybrookephotos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="https://facebook.com/HaileyBrookePhotography"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-dark-gray flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-medium-gray">
          <p>&copy; {new Date().getFullYear()} Hailey Brooke Photography. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link href="/accessibility" className="hover:text-white transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
