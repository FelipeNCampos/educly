import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, MessageCircle, Mail, Clock, CheckCircle2, Sparkles, RefreshCcw, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";
import { FloatingSupportChat } from "@/components/landing/FloatingSupportChat";
import { CompanyInfo } from "@/components/landing/CompanyInfo";

const Contact = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const aiCapabilities = [
    t('contactPage.aiCapabilities.item1'),
    t('contactPage.aiCapabilities.item2'),
    t('contactPage.aiCapabilities.item3'),
    t('contactPage.aiCapabilities.item4'),
    t('contactPage.aiCapabilities.item5'),
    t('contactPage.aiCapabilities.item6'),
  ];

  const handleOpenChat = () => {
    const event = new Event('open-support-chat');
    window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Back button */}
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('contactPage.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('contactPage.subtitle')}
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
          {/* AI Chat Card */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{t('contactPage.aiChat.title')}</CardTitle>
              <CardDescription className="text-base">
                {t('contactPage.aiChat.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                <Sparkles className="w-4 h-4" />
                {t('contactPage.aiChat.available')}
              </div>
              <Button onClick={handleOpenChat} className="w-full" size="lg">
                <MessageCircle className="w-4 h-4 mr-2" />
                {t('contactPage.aiChat.button')}
              </Button>
            </CardContent>
          </Card>

          {/* Human Support Card */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-accent/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{t('contactPage.humanSupport.title')}</CardTitle>
              <CardDescription className="text-base">
                {t('contactPage.humanSupport.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {t('contactPage.humanSupport.responseTime')}
              </div>
              <Button 
                onClick={() => window.open('https://mail.google.com/mail/?view=cm&to=contact@educly.app', '_blank')}
                className="w-full" 
                size="lg"
              >
                <Mail className="w-4 h-4 mr-2" />
                {t('contactPage.humanSupport.button')}
              </Button>
              
              <p className="text-sm text-muted-foreground font-mono">
                contact@educly.app
              </p>
            </CardContent>
          </Card>

          {/* Refund Card */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCcw className="w-8 h-8 text-orange-500" />
              </div>
              <CardTitle className="text-2xl">{t('contactPage.refund.title')}</CardTitle>
              <CardDescription className="text-base">
                {t('contactPage.refund.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {t('contactPage.refund.responseTime')}
              </div>
              <Button 
                onClick={() => window.open('https://mail.google.com/mail/?view=cm&to=contact@educly.app&su=Solicitação de Reembolso', '_blank')}
                className="w-full" 
                size="lg"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                {t('contactPage.refund.button')}
              </Button>
              
              <p className="text-sm text-muted-foreground font-mono">
                contact@educly.app
              </p>
            </CardContent>
          </Card>

          {/* Feedback Card - Bugs e Ideias */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-purple-500" />
              </div>
              <CardTitle className="text-2xl">{t('contactPage.feedback.title')}</CardTitle>
              <CardDescription className="text-base">
                {t('contactPage.feedback.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {t('contactPage.feedback.responseTime')}
              </div>
              <Button 
                onClick={() => window.open('https://mail.google.com/mail/?view=cm&to=contact@educly.app&su=Feedback: Bug/Sugestão', '_blank')}
                className="w-full" 
                size="lg"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                {t('contactPage.feedback.button')}
              </Button>
              
              <p className="text-sm text-muted-foreground font-mono">
                contact@educly.app
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Capabilities Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            {t('contactPage.aiCapabilities.title')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {aiCapabilities.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Company Info Section */}
        <div className="max-w-3xl mx-auto">
          <CompanyInfo variant="full" />
        </div>
      </main>

      <Footer />
      <FloatingSupportChat />
    </div>
  );
};

export default Contact;
