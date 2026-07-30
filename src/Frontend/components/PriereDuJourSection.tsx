import { useMemo, useState } from 'react';
import { BookOpen, Check, Copy, Heart, Share2 } from 'lucide-react';
import { motion } from 'motion/react';

const PRIERES = [
  {
    verset: 'Psaume 46 : 2',
    citation: 'Dieu est pour nous un refuge et un appui, un secours qui ne manque jamais dans la détresse.',
    texte: 'Père céleste, merci pour ce jour nouveau. Conduis mes pas, affermis ma foi et remplis mon cœur de ta paix. Donne-moi la force d’aimer, de servir et de témoigner de ta grâce autour de moi. Au nom de Jésus, amen.',
  },
  {
    verset: 'Proverbes 3 : 5-6',
    citation: 'Confie-toi en l’Éternel de tout ton cœur, et ne t’appuie pas sur ta sagesse.',
    texte: 'Seigneur, je remets cette journée entre tes mains. Éclaire mes décisions, garde ma famille et ouvre mon cœur à ta volonté. Que ta sagesse m’accompagne dans chaque rencontre. Au nom de Jésus, amen.',
  },
  {
    verset: 'Philippiens 4 : 6-7',
    citation: 'Ne vous inquiétez de rien ; mais en toute chose faites connaître vos besoins à Dieu.',
    texte: 'Dieu de paix, je dépose devant toi mes préoccupations et mes projets. Remplace mon inquiétude par ta paix et aide-moi à garder confiance en ta fidélité. Au nom de Jésus, amen.',
  },
];

export default function PriereDuJourSection() {
  const [messageAction, definirMessageAction] = useState('');
  const { date, priere } = useMemo(() => {
    const maintenant = new Date();
    const debutAnnee = new Date(maintenant.getFullYear(), 0, 0);
    const index = Math.floor((maintenant.getTime() - debutAnnee.getTime()) / 86_400_000) % PRIERES.length;
    return {
      date: new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(maintenant),
      priere: PRIERES[index],
    };
  }, []);

  const contenuPartage = `Prière du jour — ${priere.verset}\n« ${priere.citation} »\n\n${priere.texte}`;

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
            <blockquote className="rounded-2xl border border-[#e7d4b0]/80 bg-white/70 p-6 text-center dark:border-slate-700 dark:bg-slate-950/30">
              <BookOpen className="mx-auto mb-3 w-5 h-5 text-[#af894d] dark:text-[#c29f63]" />
              <p className="font-serif text-xl italic leading-relaxed text-slate-800 dark:text-slate-200">« {priere.citation} »</p>
              <footer className="mt-3 text-xs font-bold uppercase tracking-widest text-[#af894d] dark:text-[#c29f63]">{priere.verset}</footer>
            </blockquote>

            <div className="rounded-2xl bg-slate-900 p-7 text-center text-slate-100 shadow-lg dark:bg-slate-950 sm:p-9">
              <p className="font-serif text-lg leading-8 sm:text-xl">{priere.texte}</p>
            </div>
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
