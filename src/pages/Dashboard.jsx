import React, { useState } from 'react';
import HeroSection from '../components/Dashboard/herosection'
import MainSection from '../components/Dashboard/MainSection'
import Avatar from '../components/Dashboard/avatar'
import Pdfview from '../components/Dashboard/pdfview'
import ImmersiveReader from '../components/Dashboard/immersive_reader';

export default function Dashboard() {
  return (
    <main>
      <HeroSection />
      <MainSection />
      <Avatar />
      <Pdfview />
      <ImmersiveReader />
    </main>
  )
}

