'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function ProfileImage() {
  const [imgSrc, setImgSrc] = useState('/profile.jpg');

  const handleError = () => {
    setImgSrc('https://via.placeholder.com/256x256?text=Jason+Chen');
  };

  return (
    <div className="relative w-64 h-64 rounded-full overflow-hidden border-2 border-white shadow-lg">
      <Image 
        src={imgSrc} 
        alt="Jason Chen"
        fill
        sizes="(max-width: 768px) 100vw, 256px"
        className="object-cover w-full h-full"
        onError={handleError}
        style={{ 
          objectPosition: 'center 30%',
        }}
        priority
      />
    </div>
  );
} 