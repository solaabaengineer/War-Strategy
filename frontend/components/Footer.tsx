"use client";

import Link from "next/link";
import { Mail, Github, Twitter } from "lucide-react";

/**
 * Footer component
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-military-light border-t border-military-olive mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-military-gold font-bold mb-4">WSTR</h3>
            <p className="text-gray-400 text-sm">
              Real balance sheet memecoin backed by conflict resources on Solana.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-gray-200 font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-400 hover:text-military-gold">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/conflicts" className="text-gray-400 hover:text-military-gold">
                  Conflicts
                </Link>
              </li>
              <li>
                <Link href="/balance-sheet" className="text-gray-400 hover:text-military-gold">
                  Balance Sheet
                </Link>
              </li>
              <li>
                <Link href="/tokenomics" className="text-gray-400 hover:text-military-gold">
                  Tokenomics
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-gray-200 font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/docs/whitepaper" className="text-gray-400 hover:text-military-gold">
                  Whitepaper
                </Link>
              </li>
              <li>
                <Link href="/docs/docs" className="text-gray-400 hover:text-military-gold">
                  Documentation
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-military-gold">
                  API Docs
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-gray-200 font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-military-gold transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-military-gold transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href="mailto:info@warstrategy.io"
                className="text-gray-400 hover:text-military-gold transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-military-olive pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>
              &copy; {currentYear} War Strategy. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="hover:text-military-gold transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-military-gold transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-military-gold transition-colors">
                Disclaimer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
