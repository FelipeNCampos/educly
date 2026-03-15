import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Circle, Lock, Star, Zap, Crown, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const Plan = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  // Buscar todas as trilhas e progresso
  const { data: trailsData } = useQuery({
    queryKey: ["all-trails-progress"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      // Buscar todas as ferramentas
      const { data: tools, error: toolsError } = await supabase.from("ai_tools").select("*").order("name");

      if (toolsError) throw toolsError;

      // Para cada ferramenta, buscar fases e progresso
      const trailsWithProgress = await Promise.all(
        tools.map(async (tool) => {
          // Buscar fases
          const { data: phases } = await supabase.from("trail_phases").select("id").eq("ai_tool_id", tool.id);

          const totalPhases = phases?.length || 0;

          // Buscar progresso
          const phaseIds = phases?.map((p) => p.id) || [];
          if (phaseIds.length === 0) {
            return {
              ...tool,
              totalPhases,
              completedPhases: 0,
              status: "not-started" as const,
              progressPercentage: 0,
            };
          }

          const { data: progress } = await supabase
            .from("user_progress")
            .select("*")
            .eq("user_id", user.id)
            .in("phase_id", phaseIds)
            .eq("completed", true);

          const completedPhases = progress?.length || 0;
          const progressPercentage = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;

          let status: "not-started" | "in-progress" | "completed" = "not-started";
          if (completedPhases === totalPhases && totalPhases > 0) {
            status = "completed";
          } else if (completedPhases > 0) {
            status = "in-progress";
          }

          return {
            ...tool,
            totalPhases,
            completedPhases,
            status,
            progressPercentage,
          };
        }),
      );

      return trailsWithProgress;
    },
  });

  const notStarted = trailsData?.filter((t) => t.status === "not-started") || [];
  const inProgress = trailsData?.filter((t) => t.status === "in-progress") || [];
  const completed = trailsData?.filter((t) => t.status === "completed") || [];

  const totalCompleted = trailsData?.reduce((acc, t) => acc + t.completedPhases, 0) || 0;
  const totalPhases = trailsData?.reduce((acc, t) => acc + t.totalPhases, 0) || 0;
  const overallProgress = totalPhases > 0 ? Math.round((totalCompleted / totalPhases) * 100) : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-primary" />;
      case "in-progress":
        return <Circle className="w-5 h-5 text-blue-400 animate-pulse" />;
      default:
        return <Lock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  // Planos Premium
  const premiumPlans = [
    {
      id: "4-weeks",
      title: "PLANO DE 4 SEMANAS",
      originalPrice: "USD 59.90",
      discountedPrice: "USD 29.90",
      weeklyPrice: "USD 1.07",
      popular: false,
      features: [
        "Acesso a todas as trilhas básicas",
        "Suporte por email",
        "Certificado de conclusão",
        "Acesso por 4 semanas",
      ],
    },
    {
      id: "12-weeks",
      title: "PLANO DE 12 SEMANAS",
      originalPrice: "USD 179.70",
      discountedPrice: "USD 89.85",
      weeklyPrice: "USD 7.49",
      popular: true,
      features: [
        "Acesso a todas as trilhas premium",
        "Suporte prioritário 24/7",
        "Certificado verificado",
        "Mentorias individuais",
        "Projetos práticos",
        "Comunidade exclusiva",
        "O dobro de resultados",
      ],
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("plan.backButton")}
          </Button>

          <div className="glass rounded-xl p-8 neon-border">
            <h1 className="text-4xl md:text-5xl font-bold neon-glow mb-4">{t("plan.title")}</h1>
            <p className="text-xl text-muted-foreground mb-6">{t("plan.subtitle")}</p>

            {/* Progresso Geral */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("plan.overallProgress")}</span>
                <span className="text-primary font-semibold">
                  {totalCompleted}/{totalPhases} {t("plan.phases")} ({overallProgress}%)
                </span>
              </div>
              <div className="w-full h-4 bg-card rounded-full overflow-hidden neon-border">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 neon-glow"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Planos Premium */}
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white">PREÇOS</h2>
            <h3 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              # EXCELENTE ESCOLHA
            </h3>
            <p className="text-xl text-muted-foreground">Comece sua jornada de aprendizado em IA hoje</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {premiumPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                  plan.popular
                    ? "border-2 border-yellow-400 shadow-2xl shadow-yellow-500/20"
                    : "border border-border/50"
                }`}
              >
                {/* Badge Mais Popular */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-6 py-2 rounded-full flex items-center gap-2 shadow-lg">
                      <Star className="w-4 h-4" fill="currentColor" />
                      MAIS POPULAR
                    </div>
                  </div>
                )}

                {/* Destaque para plano de 12 semanas */}
                {plan.id === "12-weeks" && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                      <Zap className="w-3 h-3 inline mr-1" />
                      2X RESULTADOS
                    </div>
                  </div>
                )}

                <div className="p-8 space-y-6">
                  {/* Cabeçalho do Plano */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.title}</h3>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-white">
                        {plan.weeklyPrice}
                        <span className="text-lg text-muted-foreground font-normal">/semana</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg text-muted-foreground line-through">{plan.originalPrice}</span>
                          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                            {plan.discountedPrice}
                          </span>
                        </div>
                        {plan.id === "12-weeks" && (
                          <p className="text-sm text-blue-400">
                            As pessoas que usam o plano de 12 semanas obtêm o dobro de resultados
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Lista de Benefícios */}
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-400" />
                        </div>
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Botão de Ação */}
                  <Button
                    className={`w-full py-6 text-lg font-bold transition-all duration-300 ${
                      plan.popular
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black"
                        : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    }`}
                    onClick={() => navigate(`/checkout/${plan.id}`)}
                  >
                    {plan.popular ? (
                      <div className="flex items-center gap-2">
                        <Crown className="w-5 h-5" />
                        GARANTIR MEU PLANO
                      </div>
                    ) : (
                      "ESCOLHER ESTE PLANO"
                    )}
                  </Button>
                </div>

                {/* Efeito de brilho no hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass neon-border">
            <CardHeader>
              <CardTitle className="text-3xl text-primary neon-glow">{completed.length}</CardTitle>
              <CardDescription>{t("plan.completedTrails")}</CardDescription>
            </CardHeader>
          </Card>
          <Card className="glass neon-border">
            <CardHeader>
              <CardTitle className="text-3xl text-blue-400">{inProgress.length}</CardTitle>
              <CardDescription>{t("plan.inProgressTrails")}</CardDescription>
            </CardHeader>
          </Card>
          <Card className="glass neon-border">
            <CardHeader>
              <CardTitle className="text-3xl text-muted-foreground">{notStarted.length}</CardTitle>
              <CardDescription>{t("plan.availableTrails")}</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Trilhas Concluídas */}
        {completed.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-primary neon-glow">{t("plan.completedSection")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completed.map((trail) => (
                <Card
                  key={trail.id}
                  className="glass neon-border cursor-pointer hover-lift"
                  onClick={() => navigate(`/trilha/${trail.slug}`)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl">{trail.name}</CardTitle>
                      {getStatusIcon(trail.status)}
                    </div>
                    <CardDescription>{trail.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("plan.progress")}</span>
                        <span className="text-primary font-semibold">
                          {trail.completedPhases}/{trail.totalPhases}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-card rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${trail.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Trilhas em Progresso */}
        {inProgress.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-blue-400">{t("plan.inProgressSection")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inProgress.map((trail) => (
                <Card
                  key={trail.id}
                  className="glass neon-border cursor-pointer hover-lift hover-glow"
                  onClick={() => navigate(`/trilha/${trail.slug}`)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl">{trail.name}</CardTitle>
                      {getStatusIcon(trail.status)}
                    </div>
                    <CardDescription>{trail.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("plan.progress")}</span>
                        <span className="text-blue-400 font-semibold">
                          {trail.completedPhases}/{trail.totalPhases}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-card rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-400 transition-all duration-300"
                          style={{ width: `${trail.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Trilhas Não Iniciadas */}
        {notStarted.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-muted-foreground">{t("plan.availableSection")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notStarted.map((trail) => (
                <Card
                  key={trail.id}
                  className="glass border-border/50 cursor-pointer hover-lift"
                  onClick={() => navigate(`/trilha/${trail.slug}`)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl">{trail.name}</CardTitle>
                      {getStatusIcon(trail.status)}
                    </div>
                    <CardDescription>{trail.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      {t("plan.startTrailButton")}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Plan;
