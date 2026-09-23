import { Suspense } from 'react';
import TeamsPage from './TeamsPage'; // Or whatever your internal component is called
import MyTeamPage from './MyTeamPage';

export default function TeamsMainPage() {
  return (
    // This allows Next.js to skip static generation for this dynamic part
    <Suspense fallback={<div>Loading Teams...</div>}>
      <TeamsPage></TeamsPage>
      {/* <MyTeamPage></MyTeamPage> */}
    </Suspense>
  );
}