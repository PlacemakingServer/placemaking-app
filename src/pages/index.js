import { checkAndSyncIfEmpty } from '@/utils/checkAndSyncIfEmpty';
import { useEffect } from 'react';
export default function Home() {
  useEffect(() => {
    checkAndSyncIfEmpty();
  }, []);


  return (
    <div>
      <h1>Home</h1>
    </div>
  );
  
}

Home.layout = "private";
Home.pageName = "Home";