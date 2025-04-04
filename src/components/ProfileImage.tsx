'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function ProfileImage() {
  const [imgSrc, setImgSrc] = useState('/profile.jpg');

  const handleError = () => {
    setImgSrc('https://via.placeholder.com/256x256?text=Jason+Chen');
  };

  return (
    <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-white shadow-lg">
      <Image 
        src={imgSrc} 
        alt="Jason Chen"
        width={256}
        height={256}
        className="object-cover"
        onError={handleError}
        style={{ 
          objectPosition: 'center 30%',
        }}
        priority
      />
    </div>
  );
} 