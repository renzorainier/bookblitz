'use client';

import { useState } from 'react';
import Main from './Main.jsx';
import Navbar from './Navbar.jsx';
import Head from 'next/head.js';


export default function Home() {
  const [activeComponent, setActiveComponent] = useState('attendance'); // State for toggling components

  return (
    <>
<Head>
  <title>KommUnity</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link
    href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&family=Tiny5&display=swap" rel="stylesheet"
    rel="stylesheet"
  />
  <link rel="manifest" href="/manifest.json" />
</Head>

      <div>

        {/* <Navbar activeComponent={activeComponent} setActiveComponent={setActiveComponent} /> */}
        <Main activeComponent={activeComponent} />
      </div>
    </>
  );
}
