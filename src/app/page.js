import HomeExp from '@/components/homePages/HomeExp';
import NavbarHome from '@/components/NavbarHome';
import OnboardingRequestForm from '@/Form/OnboardingRequestForm';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <NavbarHome></NavbarHome>
      <HomeExp></HomeExp>
    </div>
  );
}
