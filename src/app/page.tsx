import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { StoreCards, TrustStrip } from "@/components/StoreCards";
import { ComingSoon } from "@/components/ComingSoon";
import { EarlyAccess } from "@/components/EarlyAccess";
import { WhyShop } from "@/components/WhyShop";
import { ShopPreview } from "@/components/ShopPreview";
import { StoreStory } from "@/components/StoreStory";
import { LaunchOffer } from "@/components/LaunchOffer";
import { Legal } from "@/components/Legal";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <StoreCards />
        <ComingSoon />
        <EarlyAccess />
        <WhyShop />
        <ShopPreview />
        <StoreStory />
        <LaunchOffer />
        <Legal />
      </main>
      <SiteFooter />
    </>
  );
}

