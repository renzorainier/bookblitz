'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore'; // Import getDoc instead of onSnapshot
import success from './success.wav';
import SortingGame from './SortingGame';
import Navbar from './Navbar'; // Import the refactored Navbar component
import MainScreen from './MainScreen'; // Import the refactored Navbar component


export default function Main() {
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [postData, setPostData] = useState(null);
  const [activeComponent, setActiveComponent] = useState('feed'); // Default to Feed
  const router = useRouter();

  const handleUserCheck = useCallback(async () => { // Make the function async
    if (!user) {
      router.push('/sign-in');
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    try {
      const userDocSnapshot = await getDoc(userDocRef); // Use getDoc and await
      if (userDocSnapshot.exists()) {
        const data = userDocSnapshot.data();
        setUserData(data);

        const audio = new Audio(success);
        audio.play().catch((err) => console.error('Failed to play sound:', err));
      } else {
        router.push('/error');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      // Optionally set an error state here
    }

    const postDocRef = doc(db, 'posts', 'posts');
    try {
      const postDocSnapshot = await getDoc(postDocRef); // Use getDoc and await
      if (postDocSnapshot.exists()) {
        const data = postDocSnapshot.data();
        setPostData(data);
      }
    } catch (err) {
      console.error('Error fetching post data:', err);
      // Optionally set an error state here
    }

    // No need to return an unsubscribe function with getDoc
  }, [user, router]);

  useEffect(() => {
    if (!loading && !error) {
      handleUserCheck();
    }
  }, [user, loading, error, handleUserCheck]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const renderComponent = () => {
    switch (activeComponent) {
      default:
        return <MainScreen postData={postData} userData={userData} />;
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 relative">
      {/* Navbar */}
      {/* <Navbar activeComponent={activeComponent} setActiveComponent={setActiveComponent} /> */}

      {/* Active Component */}
      <section >{renderComponent()}</section>
    </main>
  );
}


// 'use client';

// import { useEffect, useState, useCallback } from 'react';
// import { useAuthState } from 'react-firebase-hooks/auth';
// import { auth, db } from '@/app/firebase/config';
// import { useRouter } from 'next/navigation';
// import { doc, onSnapshot } from 'firebase/firestore';
// import success from './success.wav';
// import SortingGame from './SortingGame';
// import Navbar from './Navbar'; // Import the refactored Navbar component

// export default function Main() {
//   const [user, loading, error] = useAuthState(auth);
//   const [userData, setUserData] = useState(null);
//   const [postData, setPostData] = useState(null);
//   const [activeComponent, setActiveComponent] = useState('feed'); // Default to Feed
//   const router = useRouter();

//   const handleUserCheck = useCallback(() => {
//     if (!user) {
//       router.push('/sign-in');
//       return;
//     }

//     const userDocRef = doc(db, 'users', user.uid);
//     const unsubscribeUser = onSnapshot(userDocRef, (docSnapshot) => {
//       if (docSnapshot.exists()) {
//         const data = docSnapshot.data();
//         setUserData(data);

//         const audio = new Audio(success);
//         audio.play().catch((err) => console.error('Failed to play sound:', err));
//       } else {
//         router.push('/error');
//       }
//     });

//     const postDocRef = doc(db, 'posts', 'posts');
//     const unsubscribePost = onSnapshot(postDocRef, (docSnapshot) => {
//       if (docSnapshot.exists()) {
//         const data = docSnapshot.data();
//         setPostData(data);
//       }
//     });

//     return () => {
//       unsubscribeUser();
//       unsubscribePost();
//     };
//   }, [user, router]);

//   useEffect(() => {
//     if (!loading && !error) {
//       handleUserCheck();
//     }
//   }, [user, loading, error, handleUserCheck]);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error.message}</div>;
//   }

//   const renderComponent = () => {
//     switch (activeComponent) {

//       default:
//         return <SortingGame postData={postData} userData={userData} />;
//     }
//   };

//   return (
//     <main className="min-h-screen bg-gray-100 relative">
//       {/* Navbar */}
//       {/* <Navbar activeComponent={activeComponent} setActiveComponent={setActiveComponent} /> */}

//       {/* Active Component */}
//       <section className={`${activeComponent === 'feed' ? 'pt-16' : ''}`}>{renderComponent()}</section>
//     </main>
//   );
// }

