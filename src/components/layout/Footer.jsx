import React from 'react';
import { Link } from '../../context/RouterContext';

export default function Footer() {
  return (
    <footer className="bg-background border-t border-white/5 py-12 px-6 md:px-12 text-xs text-text-muted mt-20 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
        
        {/* Brand Column */}
        <div className="col-span-2 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Link to="/" className="text-xl font-extrabold tracking-wider text-brand-accent">
              SCF STUDIOS
            </Link>
            <span className="text-[10px] font-light text-white/70 tracking-wider uppercase">
              Samya Choudhury Films
            </span>
          </div>
          <p className="max-w-xs text-text-secondary font-medium leading-relaxed">
            Premium cinematic blockbusters, web series, and kids entertainment, all in one space.
          </p>
          <div className="flex gap-4 mt-2">
            <span className="cursor-pointer hover:text-text-primary">Twitter</span>
            <span className="cursor-pointer hover:text-text-primary">Instagram</span>
            <span className="cursor-pointer hover:text-text-primary">YouTube</span>
          </div>
        </div>

        {/* Company Column */}
        <div className="flex flex-col gap-2.5">
          <h4 className="font-bold text-text-secondary uppercase tracking-wider text-[11px] mb-1">Company</h4>
          <span className="cursor-pointer hover:text-text-primary transition-colors">About Us</span>
          <span className="cursor-pointer hover:text-text-primary transition-colors">Careers</span>
          <span className="cursor-pointer hover:text-text-primary transition-colors">Contact</span>
          <span className="cursor-pointer hover:text-text-primary transition-colors">Press Kit</span>
        </div>

        {/* Support Column */}
        <div className="flex flex-col gap-2.5">
          <h4 className="font-bold text-text-secondary uppercase tracking-wider text-[11px] mb-1">Support</h4>
          <span className="cursor-pointer hover:text-text-primary transition-colors">Help Center</span>
          <span className="cursor-pointer hover:text-text-primary transition-colors">FAQ</span>
          <span className="cursor-pointer hover:text-text-primary transition-colors">Redeem Vouchers</span>
          <span className="cursor-pointer hover:text-text-primary transition-colors">Device Setup</span>
        </div>

        {/* Legal & Policies Column */}
        <div className="flex flex-col gap-2.5">
          <h4 className="font-bold text-text-secondary uppercase tracking-wider text-[11px] mb-1">Legal &amp; Policies</h4>
          <span className="cursor-pointer hover:text-text-primary transition-colors">Terms of Service</span>
          <span className="cursor-pointer hover:text-text-primary transition-colors">Privacy Policy</span>
          <span className="cursor-pointer hover:text-text-primary transition-colors">Cookie Preferences</span>
        </div>

      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between border-t border-white/5 mt-10 pt-6 gap-4">
        <div>
          &copy; 2026 SCF Studios. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <span className="cursor-pointer hover:text-text-primary">iOS App</span>
          <span className="cursor-pointer hover:text-text-primary">Android App</span>
          <span className="cursor-pointer hover:text-text-primary">Smart TV App</span>
        </div>
      </div>
    </footer>
  );
}
