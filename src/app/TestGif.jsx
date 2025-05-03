// components/TestGif.js
import Image from 'next/image';
import loadingGif from './Arrow.gif'; // Assuming your GIF is in the public folder

const TestGif = () => {
  return (
    <div>
      <h1>Testing GIF</h1>
      <Image
        src={loadingGif}
        alt="Loading GIF"
        width={100} // Adjust as needed
        height={100} // Adjust as needed
      />
    </div>
  );
};

export default TestGif;