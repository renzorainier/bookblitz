// layout.js
import "./globals.css";
import { Urbanist } from 'next/font/google';
import { UserDataProvider } from '@/UserDataContext';

const inter = Urbanist({ subsets: ['latin'] });

export const metadata = {
  title: "MVBA",
  description: "Metro View Baptist Academy",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserDataProvider>
          {children}
        </UserDataProvider>
      </body>
    </html>
  );
}



// import "./globals.css";
// import { Urbanist } from 'next/font/google'

// const inter = Urbanist({ subsets: ['latin'] })

// export const metadata = {
//   title: "MVBA",
//   description: "Metro View Baptist Academy",
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className={inter.className} >{children}</body>
//     </html>
//   );
// }
