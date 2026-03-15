import { Button } from "./ui/button";
import { Gift, ArrowRight } from "lucide-react";

export const AppPromo = ({ title, description, buttonText, link }: any) => {
    
  return (
    <div className="my-8 p-8 rounded-[32px] bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-white/20 p-2 rounded-xl">
          <Gift className="w-6 h-6 text-white" />
        </div>
        <span className="text-xs font-black uppercase tracking-widest opacity-80">Oferta Especial</span>
      </div>
      
      <h3 className="text-2xl font-black mb-3 leading-tight">{title}</h3>
      <p className="text-orange-50 mb-6 leading-relaxed opacity-90">{description}</p>
      
      <Button 
        asChild 
        className="w-full py-7 rounded-2xl bg-white text-orange-600 hover:bg-orange-50 font-black text-lg shadow-lg"
      >
        <a href={link} className="flex items-center justify-center gap-2">
          {buttonText} <ArrowRight className="w-5 h-5" />
        </a>
      </Button>
    </div>
  );
};