/**
 * Testimonial Component
 * Displays user testimonials with ratings
 */

import { Star } from 'lucide-react';

export interface TestimonialProps {
  name: string;
  role: string;
  content: string;
  rating: number;
  savings?: string;
  avatar?: string;
}

export function Testimonial({
  name,
  role,
  content,
  rating,
  savings,
  avatar,
}: TestimonialProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Rating Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i < rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Testimonial Content */}
      <p className="text-gray-700 mb-6 italic">"{content}"</p>

      {/* Savings Badge */}
      {savings && (
        <div className="mb-4 inline-block">
          <span className="bg-success-100 text-success-800 text-sm font-semibold px-3 py-1 rounded-full">
            💰 Saved {savings}
          </span>
        </div>
      )}

      {/* User Info */}
      <div className="flex items-center gap-3">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-600 font-semibold text-lg">
              {name.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-900">{name}</p>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </div>
    </div>
  );
}
