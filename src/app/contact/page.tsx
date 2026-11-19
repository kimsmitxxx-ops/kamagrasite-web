import type { Metadata } from "next";
import { teksten } from "@/lib/teksten-server";
import { PageHero } from "@/components/shop/page-hero";
import { MessageCircle, Mail, Clock, MapPin } from "lucide-react";
import { ContactForm } from "@/components/shop/contact-form";
import { alternatesNL } from "@/lib/geo-nl";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Contact - Kamagra Site",
  description: "Bereik Kamagra Site via online chat, e-mail of contactformulier. Antwoord binnen 48 uur, ook in het weekend.",
  alternates: alternatesNL("/contact/"),
};

export default async function ContactPage() {
  const t = await teksten();
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={t.contact.kop}
        intro={t.contact.intro}
      />

      <section className="mx-auto max-w-7xl px-4 py-14 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-5">
          <div className="rounded-md border border-primary-muted bg-primary p-6 text-primary-foreground">
            <MessageCircle size={20} className="text-accent" />
            <h3 className="mt-3 font-display text-lg text-primary-foreground">{t.contact.chatKop}</h3>
            <p className="mt-1 text-sm text-primary-foreground/75">
              Snelste route. Stuur foto&apos;s van je strip of een schermafbeelding van je order mee.
            </p>
            <button
              type="button"
              className="mt-3 inline-flex items-center text-sm font-medium text-accent hover:underline"
            >
              Start live chat
            </button>
          </div>
          <div className="rounded-md border border-primary-muted bg-primary p-6 text-primary-foreground">
            <Mail size={20} className="text-accent" />
            <h3 className="mt-3 font-display text-lg text-primary-foreground">{t.contact.berichtKop}</h3>
            <p className="mt-2 text-sm text-primary-foreground/75">
              Gebruik het formulier hieronder. Zet je ordernummer erbij als het over een bestelling gaat, of de batchcode van je strip als je twijfelt over de verpakking. Antwoord binnen 48 uur.
            </p>
          </div>
          <div className="rounded-md border border-primary-muted bg-primary p-6 text-primary-foreground">
            <Clock size={20} className="text-accent" />
            <h3 className="mt-3 font-display text-lg text-primary-foreground">{t.contact.tijdenKop}</h3>
            <ul className="mt-2 space-y-1 text-sm text-primary-foreground/75">
              <li>{t.contact.tijdenWeek}</li>
              <li>{t.contact.tijdenWeekend}</li>
            </ul>
          </div>
          <div className="rounded-md border border-primary-muted bg-primary p-6 text-primary-foreground">
            <MapPin size={20} className="text-accent" />
            <h3 className="mt-3 font-display text-lg text-primary-foreground">{t.contact.vestigingKop}</h3>
            <p className="mt-1 text-sm text-primary-foreground/75">
              Wij verzenden vanuit Nederland. Bezoek aan het magazijn is niet mogelijk. <br />
              Vestigingsadres, KvK- en BTW-nummer staan op de factuur.
            </p>
          </div>
        </div>

        <ContactForm />
      </section>
    </>
  );
}
