import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { useToast } from '../../context/ToastContext';
import { Check, ArrowLeft, CreditCard } from 'lucide-react';
import Badge from '../../components/common/Badge';

export default function Plans() {
  const { currentUser, updateSubscription } = useAuth();
  const { navigate } = useRouter();
  const { addToast } = useToast();

  const planTiers = [
    {
      id: "free",
      name: "Free",
      price: "₹0",
      period: "month",
      description: "Basic entry plan with ad-supported viewing.",
      features: [
        "Standard quality streaming (480p)",
        "Ad-supported playback",
        "Single active screen stream",
        "Access to basic movies & select originals"
      ],
      badge: "Basic"
    },
    {
      id: "premium",
      name: "Premium",
      price: "₹199",
      period: "month",
      description: "Ad-free ultra quality with original content access.",
      features: [
        "Ultra HD (4K) & Full HD streaming",
        "100% Ad-Free viewing",
        "Stream on up to 2 screens simultaneously",
        "Access to premium Originals & movies",
        "Offline downloading support"
      ],
      badge: "Popular",
      isPopular: true
    },
    {
      id: "family",
      name: "Family Space",
      price: "₹299",
      period: "month",
      description: "Covers the entire household under one shared space.",
      features: [
        "Ultra HD (4K) & HDR streaming",
        "100% Ad-Free viewing",
        "Stream on up to 5 screens simultaneously",
        "Access to premium Originals & movies",
        "Offline downloading support",
        "Dedicated kids mode accounts"
      ],
      badge: "Best Value"
    }
  ];

  const handleSelectPlan = (tierName) => {
    updateSubscription(tierName);
    addToast(`Successfully switched plan to ${tierName}!`, "success");
    navigate('/account');
  };

  const activePlan = currentUser?.subscription || "Free";

  return (
    <div className="pb-16 min-h-screen bg-background pt-24 select-text">
      
      {/* Header navigations */}
      <div className="max-w-6xl mx-auto mb-10">
        <button
          onClick={() => navigate('/account')}
          className="text-xs text-text-secondary hover:text-white flex items-center gap-1.5 font-bold uppercase transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Account
        </button>
      </div>

      <div className="max-w-5xl mx-auto text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 uppercase tracking-wide">
          Choose the Perfect Entertainment Plan
        </h1>
        <p className="text-sm text-text-secondary max-w-xl mx-auto leading-relaxed">
          Upgrade your plan anytime to unlock premium originals, ad-free streaming, and beautiful 4K cinematic clarity.
        </p>
      </div>

      {/* Plans List Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {planTiers.map(plan => {
          const isActive = activePlan.toLowerCase() === plan.name.toLowerCase() || (activePlan === "Premium" && plan.id === "premium");
          
          return (
            <div
              key={plan.id}
              className={`bg-card-bg border rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 relative ${
                plan.isPopular
                  ? 'border-brand-accent shadow-xl shadow-brand-accent/5 scale-105'
                  : 'border-white/5 hover:border-white/10'
              }`}
            >
              {/* Popular / Premium tag overlay */}
              {plan.badge && (
                <div className="absolute top-4 right-4">
                  <Badge variant={plan.isPopular ? 'original' : 'default'} className="text-[8px] font-bold py-0.5">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              {/* Title Section */}
              <div className="mb-6">
                <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2">{plan.name}</h3>
                <p className="text-xs text-text-muted leading-snug">{plan.description}</p>
                <div className="flex items-baseline mt-4 gap-1">
                  <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-xs text-text-muted">/{plan.period}</span>
                </div>
              </div>

              {/* Features list */}
              <ul className="space-y-3 mb-8 border-t border-white/5 pt-6 text-xs text-text-secondary">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 leading-snug">
                    <Check className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              {/* Select Upgrade button */}
              <button
                onClick={() => handleSelectPlan(plan.name)}
                disabled={isActive}
                className={`w-full py-3 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white/10 text-emerald-400 border border-emerald-500/20 cursor-default flex items-center justify-center gap-1.5'
                    : plan.isPopular
                      ? 'bg-brand-accent hover:bg-brand-accent-hover text-white shadow-lg'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                }`}
              >
                {isActive ? (
                  <>
                    <Check className="w-4 h-4" />
                    Active Plan
                  </>
                ) : (
                  <>Upgrade / Switch Plan</>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="max-w-3xl mx-auto mt-14 p-4 rounded-xl bg-card-bg/20 border border-white/5 text-center text-[10px] text-text-muted">
        <CreditCard className="w-5 h-5 mx-auto mb-2 text-text-muted" />
        SCF Studios implements mock payment systems in sandbox mode. Upgrades will update active profiles instantly without debiting real credentials.
      </div>

    </div>
  );
}
