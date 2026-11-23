import { useState } from 'react';
import { Mountain } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function ResilientImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackLabel,
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1B4332]/15 via-[#E7E3DA] to-[#D97706]/15 text-[#1B4332] p-6 text-center"
      >
        <Mountain className="w-8 h-8 opacity-60 mb-2" aria-hidden="true" />
        <span className="font-serif text-sm font-medium text-[#1F2937]/80 line-clamp-2">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
