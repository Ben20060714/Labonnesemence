import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Check, Copy, Heart, Mic, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { api, DevotionDuJourBackend } from '../services/api';

export default function PriereDuJourSection() {
  const [messageAction, definirMessageAction] = useState('');
  const [devotion, definirDevotion] = useState<DevotionDuJourBackend | null>(null);
  const [chargementDevotion, definirChargementDevotion] = useState(true);
  const date = useMemo(() => {
    const maintenant = new Date();
    return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(maintenant);
  }, []);

  const contenuPartage = devotion
    ? `Prière du jour — ${devotion.verse_reference}\n« ${devotion.verse_text} »\n\n${devotion.prayer_text}`
    : 'Prière du jour';

  useEffect(() => {
    let composantActif = true;

    api.obtenirDevotionDuJour()
      .then((donnees) => {
        if (composantActif) definirDevotion(donnees);
      })
      .catch((erreur) => console.error('Chargement de la prière du jour impossible:', erreur))
      .finally(() => {
        if (composantActif) definirChargementDevotion(false);
      });

    return () => {
      composantActif = false;
    };
  }, []);

  const copierPriere = async () => {
    try {
      await navigator.clipboard.writeText(contenuPartage);
      definirMessageAction('Prière copiée.');
    } catch {
      definirMessageAction('La copie est indisponible sur cet appareil.');
    }
  };

  const partagerPriere = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Prière du jour', text: contenuPartage });
        definirMessageAction('Prière partagée.');
      } catch {
        // L’utilisateur peut fermer la boîte de dialogue de partage sans action.
      }
      return;
    }
    await copierPriere();
  };

  return (
    <section id="priere-du-jour" className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="overflow-hidden rounded-3xl border border-[#e7d4b0] bg-gradient-to-br from-[#fffdf8] via-[#fcfaf4] to-[#f7edda] shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="p-7 sm:p-12 space-y-8">
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#af894d]/15 text-[#af894d] dark:text-[#c29f63]"><Heart className="w-7 h-7" /></div>
            <span className="block text-xs font-mono uppercase tracking-[0.25em] text-[#af894d] dark:text-[#c29f63]">Temps de recueillement</span>
            <h1 className="font-serif text-4xl font-bold text-slate-900 dark:text-slate-100">Prière du jour</h1>
            <p className="capitalize text-sm text-slate-500 dark:text-slate-400">{date}</p>
          </div>

          <div className="mx-auto max-w-3xl space-y-6">
            {chargementDevotion && (
              <div className="rounded-2xl border border-[#e7d4b0]/80 bg-white/70 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/30 dark:text-slate-400">
                Chargement de la prière du jour...
              </div>
            )}

            {!chargementDevotion && devotion && (
              <>
                {devotion.cover_image_url && (
                  <div className="overflow-hidden rounded-2xl border border-[#e7d4b0]/80 bg-white/70 dark:border-slate-700 dark:bg-slate-950/30">
                    <img
                      src={devotion.cover_image_url}
                      alt="Couverture de la prière du jour"
                      className="h-64 w-full object-cover sm:h-80"
                    />
                  </div>
                )}

                <blockquote className="rounded-2xl border border-[#e7d4b0]/80 bg-white/70 p-6 text-center dark:border-slate-700 dark:bg-slate-950/30">
                  <BookOpen className="mx-auto mb-3 w-5 h-5 text-[#af894d] dark:text-[#c29f63]" />
                  <p className="font-serif text-xl italic leading-relaxed text-slate-800 dark:text-slate-200">« {devotion.verse_text} »</p>
                  <footer className="mt-3 text-xs font-bold uppercase tracking-widest text-[#af894d] dark:text-[#c29f63]">{devotion.verse_reference}</footer>
                </blockquote>

                <div className="rounded-2xl bg-slate-900 p-7 text-center text-slate-100 shadow-lg dark:bg-slate-950 sm:p-9">
                  <p className="font-serif text-lg leading-8 sm:text-xl whitespace-pre-wrap">{devotion.prayer_text}</p>
                </div>

                {devotion.audio_url && (
                  <div className="rounded-2xl border border-[#e7d4b0]/80 bg-white/80 p-6 dark:border-slate-700 dark:bg-slate-950/30">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#af894d]/15 text-[#af894d] dark:text-[#c29f63]">
                        <Mic className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-slate-100">
                          {devotion.audio_title?.trim() || 'Exhortation vocale'}
                        </h2>
                        {devotion.audio_description?.trim() && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">{devotion.audio_description}</p>
                        )}
                      </div>
                    </div>
                    <audio controls preload="metadata" src={devotion.audio_url} className="w-full">
                      Votre navigateur ne supporte pas la lecture audio.
                    </audio>
                  </div>
                )}
              </>
            )}

            {!chargementDevotion && !devotion && (
              <div className="rounded-2xl border border-[#e7d4b0]/80 bg-white/70 p-8 text-center dark:border-slate-700 dark:bg-slate-950/30">
                <BookOpen className="mx-auto mb-3 w-5 h-5 text-[#af894d] dark:text-[#c29f63]" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Aucune prière du jour n'est encore publiée.</p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button type="button" onClick={copierPriere} className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#af894d] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#936f3c] transition-colors hover:bg-[#af894d] hover:text-white dark:text-[#e7d4b0] sm:w-auto"><Copy className="w-4 h-4" /> Copier la prière</button>
            <button type="button" onClick={partagerPriere} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#af894d] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#936f3c] sm:w-auto"><Share2 className="w-4 h-4" /> Partager</button>
          </div>
          <p aria-live="polite" className="min-h-5 text-center text-xs text-emerald-700 dark:text-emerald-400">{messageAction && <><Check className="mr-1 inline w-3.5 h-3.5" />{messageAction}</>}</p>
        </div>
      </motion.div>
    </section>
  );
}
