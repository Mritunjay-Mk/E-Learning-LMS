import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import Seo from '../../components/common/Seo';

export default function NotFound() {
  return (
    <>
      <Seo title="Page Not Found" description="The requested LearnHub AI LMS page was not found." />
      <section className="mx-auto grid min-h-[calc(100vh-var(--nav-height))] max-w-7xl place-items-center px-4">
        <GlassCard className="max-w-lg p-8 text-center">
          <p className="text-7xl font-black text-gradient">404</p>
          <h1 className="mt-4 text-3xl font-black text-ink">Page not found</h1>
          <p className="mt-3 text-muted">The page you opened is not available.</p>
          <Button to="/" className="mt-6">
            Go Home
          </Button>
        </GlassCard>
      </section>
    </>
  );
}
