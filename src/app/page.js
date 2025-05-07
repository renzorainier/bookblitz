'use client';

import { useState } from 'react';
import Main from './Main.jsx';
import Head from 'next/head.js';

export default function Home() {
  const [activeComponent] = useState('attendance'); // State for toggling components

  return (
    <>
      <Head>
        <title>BookBlitz</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&family=Tiny5&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
      </Head>

      <div>
        <Main activeComponent={activeComponent} />
      </div>
    </>
  );
}
