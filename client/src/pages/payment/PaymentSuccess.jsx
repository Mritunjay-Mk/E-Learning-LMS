import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import Seo from '../../components/common/Seo';

export default function PaymentSuccess() {
  const [params] = useSearchParams();

  return (
    <>
      <Seo title="Payment Success" description="LearnHub AI LMS payment completed successfully." />
      <section className="mx-auto grid min-h-[calc(100vh-var(--nav-height))] max-w-7xl place-items-center px-4 py-12">
        <GlassCard strong className="max-w-lg p-8 text-center">
          <CheckCircle2 className="mx-auto text-emerald-600" size={64} />
          <h1 className="mt-5 text-3xl font-black text-ink">Payment successful</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Your access has been updated. {params.get('order') && <span className="font-bold text-slate-700">Order: {params.get('order')}</span>}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button to="/dashboard">Go to Dashboard</Button>
            <Button to="/library" variant="secondary">
              Open Library
            </Button>
          </div>
          <Link to="/courses" className="mt-5 inline-block text-sm font-bold text-brand-700">
            Browse more courses
          </Link>
        </GlassCard>
      </section>
    </>
  );
}
