import { useSearchParams } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import Seo from '../../components/common/Seo';

export default function PaymentFailed() {
  const [params] = useSearchParams();

  return (
    <>
      <Seo title="Payment Failed" description="LearnHub AI LMS payment could not be completed." />
      <section className="mx-auto grid min-h-[calc(100vh-var(--nav-height))] max-w-7xl place-items-center px-4 py-12">
        <GlassCard strong className="max-w-lg p-8 text-center">
          <XCircle className="mx-auto text-rose-600" size={64} />
          <h1 className="mt-5 text-3xl font-black text-ink">Payment not completed</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{params.get('reason') || 'The checkout was cancelled or verification failed.'}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button to="/courses">Try Courses</Button>
            <Button to="/library" variant="secondary">
              Library Pass
            </Button>
          </div>
        </GlassCard>
      </section>
    </>
  );
}
